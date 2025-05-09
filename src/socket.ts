import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = import.meta.env.DEV ? 'http://localhost:5000' : undefined;

export const socket = io(URL!, {
  autoConnect: true
});