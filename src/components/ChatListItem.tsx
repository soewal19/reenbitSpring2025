import React from 'react';
import { MoreVertical } from 'lucide-react';
import { Chat } from '../types';
import { formatTime } from '../utils/helpers';
import { AnimatePresence, motion } from 'framer-motion';

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ chat, isActive, onClick }) => {
  return (
    <div 
      className={`p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-100 transition-colors relative ${
        isActive ? 'bg-blue-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium flex-shrink-0">
        {chat.firstName.charAt(0)}{chat.lastName.charAt(0)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 truncate">
            {chat.firstName} {chat.lastName}
          </h3>
          {chat.lastMessage && (
            <span className="text-xs text-gray-500">
              {formatTime(chat.lastMessage.timestamp)}
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-500 truncate">
          {chat.lastMessage ? chat.lastMessage.content : 'No messages yet'}
        </p>
      </div>
      
      <AnimatePresence>
        {chat.unreadCount && chat.unreadCount > 0 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center"
          >
            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatListItem;