import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import mongoose from 'mongoose';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// MongoDB Schema
const messageSchema = new mongoose.Schema({
  content: String,
  senderId: String,
  chatId: String,
  timestamp: { type: Date, default: Date.now },
  isEdited: { type: Boolean, default: false }
});

const chatSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  messages: [messageSchema],
  lastMessage: messageSchema,
  unreadCount: { type: Number, default: 0 }
});

const Message = mongoose.model('Message', messageSchema);
const Chat = mongoose.model('Chat', chatSchema);

// Middleware
app.use(cors());
app.use(express.json());

// Global state for broadcast functionality
const broadcastStates = new Map();

// Generate a random message every 5-15 seconds for clients with broadcasting enabled
async function getRandomQuote() {
  try {
    const response = await axios.get('https://api.quotable.io/random');
    return response.data.content;
  } catch (error) {
    console.error('Error fetching quote:', error);
    return 'The best preparation for tomorrow is doing your best today.';
  }
}

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  broadcastStates.set(socket.id, false);
  
  // Handle sending messages
  socket.on('send-message', async (data) => {
    try {
      const message = new Message({
        content: data.message.content,
        senderId: data.message.senderId,
        chatId: data.chatId,
        timestamp: new Date()
      });
      
      await message.save();
      
      const chat = await Chat.findById(data.chatId);
      if (chat) {
        chat.messages.push(message);
        chat.lastMessage = message;
        await chat.save();
      }
      
      socket.broadcast.emit('new-message', data);
      
      // Auto-response after 3 seconds
      setTimeout(async () => {
        const quote = await getRandomQuote();
        const response = {
          chatId: data.chatId,
          message: {
            id: Date.now().toString(),
            content: quote,
            senderId: data.chatId,
            timestamp: new Date()
          }
        };
        
        socket.emit('new-message', response);
      }, 3000);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });
  
  // Handle editing messages
  socket.on('edit-message', async (data) => {
    try {
      const message = await Message.findById(data.messageId);
      if (message) {
        message.content = data.content;
        message.isEdited = true;
        await message.save();
      }
      socket.broadcast.emit('message-edited', data);
    } catch (error) {
      console.error('Error editing message:', error);
    }
  });
  
  // Handle toggling broadcast
  socket.on('toggle-broadcast', (enabled) => {
    console.log(`Broadcast ${enabled ? 'enabled' : 'disabled'} for socket ${socket.id}`);
    broadcastStates.set(socket.id, enabled);
    
    if (enabled) {
      const intervalId = setInterval(async () => {
        if (!broadcastStates.get(socket.id)) {
          clearInterval(intervalId);
          return;
        }
        
        const quote = await getRandomQuote();
        socket.emit('broadcast-message', { message: quote });
      }, Math.floor(Math.random() * 10000) + 5000);
      
      socket.broadcastIntervalId = intervalId;
    } else if (socket.broadcastIntervalId) {
      clearInterval(socket.broadcastIntervalId);
      socket.broadcastIntervalId = null;
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    broadcastStates.delete(socket.id);
    
    if (socket.broadcastIntervalId) {
      clearInterval(socket.broadcastIntervalId);
    }
  });
});

// Chat API routes
app.post('/api/chats', async (req, res) => {
  try {
    const chat = new Chat(req.body);
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Error creating chat' });
  }
});

app.put('/api/chats/:id', async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Error updating chat' });
  }
});

app.delete('/api/chats/:id', async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting chat' });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});