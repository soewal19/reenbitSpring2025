import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';
import { X, Phone, Video, Settings, Send, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime, formatDate, generateId } from '../utils/helpers';
import MessageBubble from './MessageBubble';
import EditChatDialog from './EditChatDialog';
import DeleteChatDialog from './DeleteChatDialog';
import { socket } from '../socket';

const ChatMain: React.FC = () => {
  const { currentChat, addMessage, resetUnreadCount } = useChatStore();
  const { currentUser } = useUserStore();
  const [message, setMessage] = useState('');
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);
  
  useEffect(() => {
    // Reset unread count when selecting a chat
    if (currentChat) {
      resetUnreadCount(currentChat.id);
    }
  }, [currentChat, resetUnreadCount]);
  
  const handleSendMessage = () => {
    if (!message.trim() || !currentChat || !currentUser) return;
    
    const newMessage = {
      id: generateId(),
      content: message,
      senderId: currentUser.id,
      timestamp: new Date()
    };
    
    // Add message locally
    addMessage(currentChat.id, newMessage);
    
    // Send message to the server
    socket.emit('send-message', {
      chatId: currentChat.id,
      message: newMessage
    });
    
    setMessage('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-800">Select a chat to start messaging</h2>
          <p className="text-gray-500 mt-2">Choose an existing conversation or create a new one</p>
        </div>
      </div>
    );
  }
  
  // Group messages by date
  const messagesByDate: { [key: string]: typeof currentChat.messages } = {};
  
  currentChat.messages.forEach(msg => {
    const dateKey = formatDate(msg.timestamp);
    if (!messagesByDate[dateKey]) {
      messagesByDate[dateKey] = [];
    }
    messagesByDate[dateKey].push(msg);
  });
  
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            {currentChat.firstName.charAt(0)}{currentChat.lastName.charAt(0)}
          </div>
          <div>
            <h2 className="font-medium">{currentChat.firstName} {currentChat.lastName}</h2>
            <p className="text-xs text-gray-500">
              {/* This would show online status in a real app */}
              Online
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Phone size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Video size={20} />
          </button>
          <div className="relative">
            <button 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            >
              <Settings size={20} />
            </button>
            
            <AnimatePresence>
              {isOptionsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                >
                  <button 
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center space-x-2"
                    onClick={() => {
                      setIsEditDialogOpen(true);
                      setIsOptionsOpen(false);
                    }}
                  >
                    <Edit size={16} />
                    <span>Edit contact</span>
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-500 flex items-center space-x-2"
                    onClick={() => {
                      setIsDeleteDialogOpen(true);
                      setIsOptionsOpen(false);
                    }}
                  >
                    <X size={16} />
                    <span>Delete chat</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {Object.keys(messagesByDate).length > 0 ? (
          Object.entries(messagesByDate).map(([date, messages]) => (
            <div key={date} className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gray-200 rounded-full px-3 py-1 text-xs text-gray-600">
                  {date}
                </div>
              </div>
              
              <div className="space-y-4">
                {messages.map(msg => (
                  <MessageBubble 
                    key={msg.id}
                    message={msg}
                    isCurrentUser={msg.senderId === currentUser?.id}
                    chatId={currentChat.id}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">No messages yet</p>
              <p className="text-gray-400 text-sm mt-1">Send a message to start the conversation</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={1}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={`p-3 rounded-full ${
              message.trim() 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-200 text-gray-400'
            } transition-colors`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isEditDialogOpen && (
          <EditChatDialog 
            chat={currentChat} 
            onClose={() => setIsEditDialogOpen(false)} 
          />
        )}
        
        {isDeleteDialogOpen && (
          <DeleteChatDialog 
            chat={currentChat} 
            onClose={() => setIsDeleteDialogOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatMain;