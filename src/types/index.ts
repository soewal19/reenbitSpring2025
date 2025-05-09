export interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  isEdited?: boolean;
}

export interface Chat {
  id: string;
  firstName: string;
  lastName: string;
  messages: Message[];
  lastMessage?: Message;
  unreadCount?: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface SocketState {
  connected: boolean;
  broadcastEnabled: boolean;
}

export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  searchQuery: string;
}