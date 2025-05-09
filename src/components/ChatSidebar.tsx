import React, { useState } from 'react';
import { Search, Plus, Settings } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import ChatListItem from './ChatListItem';
import NewChatDialog from './NewChatDialog';
import { useSocketStore } from '../store/socketStore';

const ChatSidebar: React.FC = () => {
  const { chats, setCurrentChat, currentChat, searchQuery, setSearchQuery } = useChatStore();
  const { connected, broadcastEnabled, toggleBroadcast } = useSocketStore();
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  
  const filteredChats = chats.filter(chat => {
    const fullName = `${chat.firstName} ${chat.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full sm:w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Chats</h1>
        <div className="flex items-center space-x-2">
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsNewChatDialogOpen(true)}
          >
            <Plus size={20} />
          </button>
          <div className="relative">
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Settings size={20} />
            </button>
            <span 
              className={`absolute top-1 right-1 w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
            ></span>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>
      
      <div className="p-3 border-b border-gray-200">
        <button
          onClick={toggleBroadcast}
          className={`w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center ${
            broadcastEnabled 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          } transition-colors`}
        >
          {broadcastEnabled ? 'Disable Random Messages' : 'Enable Random Messages'}
          <span 
            className={`ml-2 inline-block w-2 h-2 rounded-full ${broadcastEnabled ? 'bg-green-500' : 'bg-gray-500'}`}
          ></span>
        </button>
      </div>
      
      <div className="overflow-y-auto flex-1">
        <AnimatePresence>
          {filteredChats.map(chat => (
            <motion.div 
              key={chat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ChatListItem 
                chat={chat} 
                isActive={currentChat?.id === chat.id}
                onClick={() => setCurrentChat(chat)}
              />
            </motion.div>
          ))}
          
          {filteredChats.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No chats found
            </div>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {isNewChatDialogOpen && (
          <NewChatDialog onClose={() => setIsNewChatDialogOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatSidebar;