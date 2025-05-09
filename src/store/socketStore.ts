import { create } from 'zustand';
import { SocketState } from '../types';
import { socket } from '../socket';

export const useSocketStore = create<SocketState & {
  setConnected: (connected: boolean) => void;
  setBroadcastEnabled: (enabled: boolean) => void;
  toggleBroadcast: () => void;
}>((set) => ({
  connected: socket.connected,
  broadcastEnabled: false,
  
  setConnected: (connected: boolean) => set({ connected }),
  
  setBroadcastEnabled: (broadcastEnabled: boolean) => set({ broadcastEnabled }),
  
  toggleBroadcast: () => {
    set((state) => {
      const newState = !state.broadcastEnabled;
      
      // Emit socket event to toggle broadcast on the server
      socket.emit('toggle-broadcast', newState);
      
      return { broadcastEnabled: newState };
    });
  }
}));