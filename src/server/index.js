require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
const QRCode = require('qrcode');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// Store active sessions
const sessions = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('create-session', () => {
    const sessionId = generateSessionId();
    sessions.set(sessionId, {
      host: socket.id,
      peers: new Set()
    });
    socket.join(sessionId);
    socket.emit('session-created', { sessionId });
  });

  socket.on('join-session', (sessionId) => {
    const session = sessions.get(sessionId);
    if (session) {
      session.peers.add(socket.id);
      socket.join(sessionId);
      socket.to(sessionId).emit('peer-joined', { peerId: socket.id });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Clean up sessions
    for (const [sessionId, session] of sessions.entries()) {
      if (session.host === socket.id) {
        sessions.delete(sessionId);
        io.to(sessionId).emit('session-ended');
      } else if (session.peers.has(socket.id)) {
        session.peers.delete(socket.id);
        socket.to(sessionId).emit('peer-left', { peerId: socket.id });
      }
    }
  });
});

// Generate a random session ID
function generateSessionId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.get('/join/:sessionId', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/join.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 