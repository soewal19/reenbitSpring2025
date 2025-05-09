import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { formatTime } from '../utils/helpers';
import { Edit, Check, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import { socket } from '../socket';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  chatId: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser, chatId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [showOptions, setShowOptions] = useState(false);
  const { editMessage } = useChatStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length
      );
    }
  }, [isEditing]);
  
  const handleEdit = () => {
    if (editedContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }
    
    if (editedContent.trim()) {
      // Update message locally
      editMessage(chatId, message.id, editedContent);
      
      // Send update to server
      socket.emit('edit-message', {
        chatId,
        messageId: message.id,
        content: editedContent
      });
      
      setIsEditing(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    } else if (e.key === 'Escape') {
      setEditedContent(message.content);
      setIsEditing(false);
    }
  };
  
  return (
    <motion.div 
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => isCurrentUser && setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      <div className={`max-w-[70%] relative group`}>
        {isCurrentUser && showOptions && !isEditing && (
          <div className="absolute -top-8 right-0 bg-white rounded-lg shadow-md flex overflow-hidden">
            <button 
              className="p-1.5 hover:bg-gray-100"
              onClick={() => setIsEditing(true)}
            >
              <Edit size={16} />
            </button>
            <button className="p-1.5 hover:bg-gray-100 text-red-500">
              <Trash2 size={16} />
            </button>
          </div>
        )}
        
        <div
          className={`rounded-2xl p-3 ${
            isCurrentUser
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-800 border border-gray-200'
          }`}
        >
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                ref={inputRef}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-white text-gray-800 p-2 rounded resize-none focus:outline-none"
                rows={3}
              />
              <div className="flex justify-end space-x-2">
                <button 
                  className="p-1 hover:bg-gray-100 rounded"
                  onClick={() => {
                    setEditedContent(message.content);
                    setIsEditing(false);
                  }}
                >
                  <X size={16} />
                </button>
                <button 
                  className="p-1 hover:bg-gray-100 rounded text-blue-500"
                  onClick={handleEdit}
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              <div className={`flex items-center text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'}`}>
                <span>{formatTime(message.timestamp)}</span>
                {message.isEdited && (
                  <span className="ml-2">• edited</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;