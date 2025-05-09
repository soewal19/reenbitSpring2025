import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { Auth } from './components/Auth';
import styles from './App.module.css';

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sent: boolean;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: Date;
  unread?: number;
}

const initialChats: Chat[] = [
  {
    id: '1',
    name: 'Alice Freeman',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    lastMessage: 'How was your meeting?',
    timestamp: new Date('2023-08-17T07:43:00'),
  },
  {
    id: '2',
    name: 'Josefina',
    avatar: 'https://images.pexels.com/photos/2726111/pexels-photo-2726111.jpeg',
    lastMessage: 'Hi! No, I am going for a walk.',
    timestamp: new Date('2023-08-16T14:23:00'),
  },
  {
    id: '3',
    name: 'Velazquez',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    lastMessage: 'Hi! I am a little sad, tell me a joke please.',
    timestamp: new Date('2023-08-14T09:15:00'),
  },
];

const initialMessages: Message[] = [
  {
    id: '1',
    content: 'Hi, how are you?',
    timestamp: new Date('2023-08-17T07:43:00'),
    sent: false,
  },
  {
    id: '2',
    content: 'Not bad. What about you?',
    timestamp: new Date('2023-08-17T07:45:00'),
    sent: true,
  },
  {
    id: '3',
    content: 'How was your meeting?',
    timestamp: new Date('2023-08-17T07:46:00'),
    sent: false,
  },
];

function App() {
  const { isAuthenticated, user } = useAuth0();
  const [selectedChat, setSelectedChat] = useState<string>('1');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isAuthenticated) {
    return <Auth />;
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date(),
      sent: true,
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            <img
              src={user?.picture || "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"}
              alt={user?.name || "User"}
              className={styles.avatarImage}
            />
          </div>
        </div>
        
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search or start new chat"
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.chatList}>
          <AnimatePresence>
            {initialChats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`${styles.chatItem} ${
                  selectedChat === chat.id ? styles.active : ''
                }`}
                onClick={() => setSelectedChat(chat.id)}
              >
                <div className={styles.avatar}>
                  <img src={chat.avatar} alt={chat.name} className={styles.avatarImage} />
                </div>
                <div className={styles.chatInfo}>
                  <div className={styles.chatName}>{chat.name}</div>
                  <div className={styles.lastMessage}>{chat.lastMessage}</div>
                </div>
                <div className={styles.timestamp}>{formatTime(chat.timestamp)}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.chatHeader}>
          <div className={styles.avatar}>
            <img
              src={initialChats[0].avatar}
              alt={initialChats[0].name}
              className={styles.avatarImage}
            />
          </div>
          <div className={styles.chatInfo}>
            <div className={styles.chatName}>{initialChats[0].name}</div>
          </div>
        </div>

        <div className={styles.messages}>
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`${styles.message} ${
                  message.sent ? styles.sent : styles.received
                }`}
              >
                <div className={styles.messageContent}>{message.content}</div>
                <div className={styles.messageTime}>
                  {formatTime(message.timestamp)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className={styles.inputContainer}>
          <div className={styles.inputWrapper}>
            <textarea
              placeholder="Type your message"
              className={styles.messageInput}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              className={styles.sendButton}
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;