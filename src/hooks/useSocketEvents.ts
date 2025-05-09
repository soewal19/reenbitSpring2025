import { useEffect } from 'react';
import { socket } from '../socket';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';
import { Message } from '../types';
import toast from 'react-hot-toast';

export default function useSocketEvents() {
  const { addMessage } = useChatStore();
  const { currentUser } = useUserStore();

  useEffect(() => {
    function onNewMessage(data: { chatId: string, message: Message }) {
      const { chatId, message } = data;
      
      // Add message to the chat
      addMessage(chatId, message);
      
      // Show toast notification for new messages
      // but only if the message is not from the current user
      if (message.senderId !== currentUser?.id) {
        toast(`New message: ${message.content.length > 30 ? message.content.substring(0, 30) + '...' : message.content}`, {
          icon: '💬',
          duration: 3000
        });
      }
    }
    
    function onBroadcastMessage(data: { message: string }) {
      toast(`Broadcast: ${data.message}`, {
        icon: '📢',
        duration: 5000
      });
    }

    socket.on('new-message', onNewMessage);
    socket.on('broadcast-message', onBroadcastMessage);

    return () => {
      socket.off('new-message', onNewMessage);
      socket.off('broadcast-message', onBroadcastMessage);
    };
  }, [addMessage, currentUser]);

  return null;
}