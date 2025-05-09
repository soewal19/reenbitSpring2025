import { create } from 'zustand';
import { User } from '../types';

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

// For simplicity, we're using a mock user for now
// In a real application, this would connect to your authentication provider
export const useUserStore = create<UserState>((set) => ({
  currentUser: {
    id: 'current-user-id',
    firstName: 'Current',
    lastName: 'User',
    email: 'user@example.com',
    avatar: 'https://i.pravatar.cc/150?img=32'
  },
  isAuthenticated: true,
  
  setUser: (user) => {
    set({ 
      currentUser: user,
      isAuthenticated: !!user 
    });
  },
  
  login: async (email, password) => {
    // This would normally be an API call to your auth endpoint
    const mockUser = {
      id: 'current-user-id',
      firstName: 'Current',
      lastName: 'User',
      email,
      avatar: 'https://i.pravatar.cc/150?img=32'
    };
    
    set({ 
      currentUser: mockUser,
      isAuthenticated: true 
    });
    
    return mockUser;
  },
  
  logout: () => {
    set({ 
      currentUser: null,
      isAuthenticated: false 
    });
  }
}));