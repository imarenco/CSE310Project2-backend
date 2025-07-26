# Backend Server - Real-Time Group Chat

A Node.js backend server for the real-time group chat application using Express and Socket.IO.

## 🚀 Features

- **Real-time messaging** with Socket.IO
- **User session management**
- **Message persistence** (in-memory)
- **Input validation** and error handling
- **CORS support** for cross-origin requests
- **Health check endpoints**
- **User join/leave notifications**

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🛠️ Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## 🏃‍♂️ Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Manual Start
```bash
node server.js
```

The server will start on `http://localhost:3000`

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)

### Network Configuration
For mobile devices to connect, you need to use your computer's IP address instead of `localhost`. 

To find your IP address:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

Update the mobile app's `SERVER_URL` to use your IP address:
```javascript
const SERVER_URL = 'http://YOUR_IP_ADDRESS:3000';
```

## 📡 API Endpoints

### REST Endpoints

#### Health Check
```
GET /health
```
Returns server status and statistics.
```json
{
  "status": "OK",
  "connectedUsers": 2,
  "totalMessages": 15
}
```

#### Get Connected Users
```
GET /users
```
Returns list of currently connected users.
```json
[
  {
    "id": "socket_id_1",
    "fullName": "John Doe"
  },
  {
    "id": "socket_id_2", 
    "fullName": "Jane Smith"
  }
]
```

#### Get All Messages
```
GET /messages
```
Returns all messages in the chat history.
```json
[
  {
    "id": "1234567890",
    "type": "user",
    "content": "Hello everyone!",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "sender": "John Doe",
    "senderId": "socket_id_1"
  }
]
```

## 🔌 Socket.IO Events

### Client to Server Events

#### Join Chat
```javascript
socket.emit('join', { fullName: 'John Doe' });
```
- **Purpose**: Join the chat room with user's full name
- **Validation**: Full name must not be empty and must be 2-50 characters

#### Send Message
```javascript
socket.emit('message', { content: 'Hello world!' });
```
- **Purpose**: Send a new message to all users
- **Validation**: Message content must not be empty

#### Typing Indicator
```javascript
socket.emit('typing', true);  // Start typing
socket.emit('typing', false); // Stop typing
```
- **Purpose**: Broadcast typing status to other users

### Server to Client Events

#### Receive Messages
```javascript
socket.on('messages', (messages) => {
  // Receive all existing messages when joining
});

socket.on('message', (message) => {
  // Receive a new message
});
```

#### User List Updates
```javascript
socket.on('users', (users) => {
  // Receive updated list of connected users
});
```

#### Typing Indicators
```javascript
socket.on('userTyping', (data) => {
  // data: { user: 'John Doe', isTyping: true }
});
```

#### Error Messages
```javascript
socket.on('error', (error) => {
  // error: { message: 'Error description' }
});
```

## 📊 Message Types

### User Messages
```json
{
  "id": "timestamp",
  "type": "user",
  "content": "Message content",
  "timestamp": "ISO timestamp",
  "sender": "User's full name",
  "senderId": "socket_id"
}
```

### System Messages
```json
{
  "id": "timestamp", 
  "type": "system",
  "content": "John Doe joined the chat",
  "timestamp": "ISO timestamp",
  "sender": "System"
}
```

## 🔒 Security Considerations

- **Input Validation**: All user inputs are validated
- **CORS**: Configured for development (allows all origins)
- **Rate Limiting**: Consider implementing for production
- **Authentication**: Not implemented - add for production use

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change the port in server.js
const PORT = process.env.PORT || 3001;
```

#### Connection Refused
- Ensure the server is running
- Check firewall settings
- Verify the port is not blocked

#### Mobile Devices Can't Connect
- Use your computer's IP address instead of `localhost`
- Ensure both devices are on the same network
- Check if your firewall allows connections on port 3000

### Debugging

#### Enable Debug Logs
```javascript
// Add to server.js
const io = socketIo(server, {
  cors: { origin: "*" },
  debug: true
});
```

#### Monitor Connections
The server logs all connections, disconnections, and messages to the console.

## 📈 Performance

### Current Limitations
- Messages stored in memory (lost on server restart)
- No message persistence
- No user authentication
- No message encryption

### Production Recommendations
- Add database for message persistence
- Implement user authentication
- Add message encryption
- Use Redis for Socket.IO scaling
- Add rate limiting
- Implement proper logging

## 📝 Development

### Project Structure
```
backend/
├── package.json      # Dependencies and scripts
├── server.js         # Main server file
└── README.md         # This file
```

### Dependencies
- `express` - Web framework
- `socket.io` - Real-time communication
- `cors` - Cross-origin resource sharing
- `nodemon` - Development auto-restart

### Adding New Features
1. Add new Socket.IO events in `server.js`
2. Update this README with new API documentation
3. Test with multiple clients

## 📄 License

MIT License - feel free to use and modify for your projects. 