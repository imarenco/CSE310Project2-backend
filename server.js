const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Store connected users
const connectedUsers = new Map();
const messages = [];

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle user joining with their name
  socket.on('join', (userData) => {
    const { fullName } = userData;
    
    if (!fullName || fullName.trim() === '') {
      socket.emit('error', { message: 'Full name is required' });
      return;
    }

    // Store user information
    connectedUsers.set(socket.id, {
      id: socket.id,
      fullName: fullName.trim(),
      joinedAt: new Date()
    });

    // Send existing messages to new user
    socket.emit('messages', messages);
    
    // Broadcast user joined message
    const joinMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: `${fullName} joined the chat`,
      timestamp: new Date().toISOString(),
      sender: 'System'
    };
    
    messages.push(joinMessage);
    io.emit('message', joinMessage);
    
    // Send updated user list
    const userList = Array.from(connectedUsers.values()).map(user => ({
      id: user.id,
      fullName: user.fullName
    }));
    io.emit('users', userList);
    
    console.log(`${fullName} joined the chat`);
  });

  // Handle new message
  socket.on('message', (messageData) => {
    const user = connectedUsers.get(socket.id);
    
    if (!user) {
      socket.emit('error', { message: 'User not found' });
      return;
    }

    const { content } = messageData;
    
    if (!content || content.trim() === '') {
      socket.emit('error', { message: 'Message cannot be empty' });
      return;
    }

    const newMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      sender: user.fullName,
      senderId: socket.id
    };

    messages.push(newMessage);
    
    // Broadcast message to all connected clients
    io.emit('message', newMessage);
    
    console.log(`Message from ${user.fullName}: ${content}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    
    if (user) {
      connectedUsers.delete(socket.id);
      
      // Broadcast user left message
      const leaveMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `${user.fullName} left the chat`,
        timestamp: new Date().toISOString(),
        sender: 'System'
      };
      
      messages.push(leaveMessage);
      io.emit('message', leaveMessage);
      
      // Send updated user list
      const userList = Array.from(connectedUsers.values()).map(user => ({
        id: user.id,
        fullName: user.fullName
      }));
      io.emit('users', userList);
      
      console.log(`${user.fullName} disconnected`);
    }
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      socket.broadcast.emit('userTyping', {
        user: user.fullName,
        isTyping
      });
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    connectedUsers: connectedUsers.size,
    totalMessages: messages.length
  });
});

// Get connected users
app.get('/users', (req, res) => {
  const userList = Array.from(connectedUsers.values()).map(user => ({
    id: user.id,
    fullName: user.fullName
  }));
  res.json(userList);
});

// Get messages
app.get('/messages', (req, res) => {
  res.json(messages);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
}); 