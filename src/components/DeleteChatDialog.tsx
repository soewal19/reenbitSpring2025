import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import { Chat } from '../types';

interface DeleteChatDialogProps {
  chat: Chat;
  onClose: () => void;
}

const DeleteChatDialog: React.FC<DeleteChatDialogProps> = ({ chat, onClose }) => {
  const { deleteChat } = useChatStore();
  
  const handleDelete = () => {
    deleteChat(chat.id);
    onClose();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Delete Chat</h2>
          <button
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium">
                Are you sure you want to delete this chat?
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                This will permanently delete your conversation with {chat.firstName} {chat.lastName} and cannot be undone.
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DeleteChatDialog;