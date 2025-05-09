import { create } from 'zustand';
import { ChatState, Chat, Message } from '../types';
import { generateId } from '../utils/helpers';

// Initial predefined chats
const initialChats: Chat[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    messages: [
      {
        id: '101',
        content: 'Hey there! How are you doing?',
        senderId: '1',
        timestamp: new Date(Date.now() - 86400000) // 1 day ago
      }
    ],
    lastMessage: {
      id: '101',
      content: 'Hey there! How are you doing?',
      senderId: '1',
      timestamp: new Date(Date.now() - 86400000)
    }
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    messages: [
      {
        id: '201',
        content: 'Did you check that project I sent you?',
        senderId: '2',
        timestamp: new Date(Date.now() - 43200000) // 12 hours ago
      }
    ],
    lastMessage: {
      id: '201',
      content: 'Did you check that project I sent you?',
      senderId: '2',
      timestamp: new Date(Date.now() - 43200000)
    }
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Johnson',
    messages: [
      {
        id: '301',
        content: 'Let\'s meet tomorrow to discuss the plan',
        senderId: '3',
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
      }
    ],
    lastMessage: {
      id: '301',
      content: 'Let\'s meet tomorrow to discuss the plan',
      senderId: '3',
      timestamp: new Date(Date.now() - 3600000)
    }
  }
];

export const useChatStore = create<ChatState>((set) => ({
  chats: initialChats,
  currentChat: null,
  searchQuery: '',
  
  setCurrentChat: (chat: Chat | null) => set({ currentChat: chat }),
  
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  
  addChat: (firstName: string, lastName: string) => {
    const newChat: Chat = {
      id: generateId(),
      firstName,
      lastName,
      messages: []
    };
    
    set((state) => ({
      chats: [...state.chats, newChat],
      currentChat: newChat
    }));
    
    return newChat;
  },
  
  updateChat: (chatId: string, firstName: string, lastName: string) => {
    set((state) => ({
      chats: state.chats.map(chat => 
        chat.id === chatId ? { ...chat, firstName, lastName } : chat
      ),
      currentChat: state.currentChat && state.currentChat.id === chatId
        ? { ...state.currentChat, firstName, lastName }
        : state.currentChat
    }));
  },
  
  deleteChat: (chatId: string) => {
    set((state) => {
      const updatedChats = state.chats.filter(chat => chat.id !== chatId);
      return {
        chats: updatedChats,
        currentChat: state.currentChat && state.currentChat.id === chatId
          ? (updatedChats.length > 0 ? updatedChats[0] : null)
          : state.currentChat
      };
    });
  },
  
  addMessage: (chatId: string, message: Message) => {
    set((state) => {
      return {
        chats: state.chats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [...chat.messages, message],
              lastMessage: message,
              unreadCount: state.currentChat?.id === chatId ? 0 : (chat.unreadCount || 0) + 1
            };
          }
          return chat;
        }),
        currentChat: state.currentChat && state.currentChat.id === chatId
          ? {
              ...state.currentChat,
              messages: [...state.currentChat.messages, message],
              lastMessage: message
            }
          : state.currentChat
      };
    });
  },
  
  editMessage: (chatId: string, messageId: string, content: string) => {
    set((state) => {
      const updatedChats = state.chats.map(chat => {
        if (chat.id === chatId) {
          const updatedMessages = chat.messages.map(msg => 
            msg.id === messageId ? { ...msg, content, isEdited: true } : msg
          );
          
          // Check if we're editing the last message
          const lastMessage = chat.lastMessage?.id === messageId
            ? { ...chat.lastMessage, content, isEdited: true }
            : chat.lastMessage;
            
          return {
            ...chat,
            messages: updatedMessages,
            lastMessage
          };
        }
        return chat;
      });
      
      const updatedCurrentChat = state.currentChat && state.currentChat.id === chatId
        ? {
            ...state.currentChat,
            messages: state.currentChat.messages.map(msg => 
              msg.id === messageId ? { ...msg, content, isEdited: true } : msg
            ),
            lastMessage: state.currentChat.lastMessage?.id === messageId
              ? { ...state.currentChat.lastMessage, content, isEdited: true }
              : state.currentChat.lastMessage
          }
        : state.currentChat;
        
      return {
        chats: updatedChats,
        currentChat: updatedCurrentChat
      };
    });
  },
  
  resetUnreadCount: (chatId: string) => {
    set((state) => ({
      chats: state.chats.map(chat => 
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    }));
  }
}));