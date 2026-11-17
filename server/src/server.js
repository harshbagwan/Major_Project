import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes.js';
import { notificationService } from './services/notificationService.js';
import { seedInitialData } from './seedData.js';
import { db } from './config/db.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Cross-Origin Resource Sharing
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Attach io to express app and notification service
app.set('io', io);
notificationService.setSocketIO(io);

// Active Online Users Registry (Socket.io Real-Time Presence)
const activeOnlineUsers = new Map(); // socket.id -> user session

function getSanitizedOnlineUsers() {
  const users = Array.from(activeOnlineUsers.values());
  const seen = new Set();
  const deduped = [];
  for (const u of users) {
    if (u && u.id && !seen.has(u.id)) {
      seen.add(u.id);
      deduped.push(u);
    } else if (u && !u.id) {
      deduped.push(u);
    }
  }
  return deduped;
}

app.set('getOnlineUsers', getSanitizedOnlineUsers);

// Socket.io Event Handling
io.on('connection', (socket) => {
  console.log(`\x1b[35m[SOCKET CONNECTED]\x1b[0m Client ID: ${socket.id}`);

  // Send current queue state and online users immediately upon connection
  socket.emit('INITIAL_STATE', {
    clinic: db.getClinic(),
    queue: db.getQueue(),
    analytics: db.getAnalytics(),
    onlineUsers: getSanitizedOnlineUsers()
  });

  // Client user signs in or connects with session
  socket.on('USER_ONLINE', (userData) => {
    if (userData && userData.name) {
      activeOnlineUsers.set(socket.id, {
        socketId: socket.id,
        id: userData.id || `guest-${socket.id.substring(0, 6)}`,
        name: userData.name,
        role: userData.role || 'patient',
        email: userData.email || '',
        phone: userData.phone || '',
        doctorId: userData.doctorId || null,
        roomNumber: userData.roomNumber || null,
        avatar: userData.avatar || (userData.role === 'doctor' ? '👨‍⚕️' : userData.role === 'admin' ? '🛡️' : userData.role === 'receptionist' ? '👩‍💼' : '🧑'),
        connectedAt: new Date().toISOString()
      });
      io.emit('ONLINE_USERS_UPDATE', getSanitizedOnlineUsers());
    }
  });

  // Client explicitly logs out
  socket.on('USER_OFFLINE', () => {
    activeOnlineUsers.delete(socket.id);
    io.emit('ONLINE_USERS_UPDATE', getSanitizedOnlineUsers());
  });

  socket.on('disconnect', () => {
    console.log(`\x1b[33m[SOCKET DISCONNECTED]\x1b[0m Client ID: ${socket.id}`);
    activeOnlineUsers.delete(socket.id);
    io.emit('ONLINE_USERS_UPDATE', getSanitizedOnlineUsers());
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// JSON 404 fallback for unknown API routes (prevents HTML <!DOCTYPE> responses)
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Global JSON error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', version: '2.1-rbac', timestamp: new Date().toISOString() });
});

// Seed data check
seedInitialData();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
  =============================================================
  🏥 MEDIQ HOSPITAL APPOINTMENT & OPD QUEUE SYSTEM (BACKEND)
  =============================================================
  🚀 Server Running:   http://localhost:${PORT}
  📡 WebSocket Ready:  Port ${PORT} (Socket.io)
  📑 REST API:         http://localhost:${PORT}/api
  📊 Analytics:        http://localhost:${PORT}/api/analytics
  👥 Online Users API: http://localhost:${PORT}/api/auth/online-users
  =============================================================
  `);
});
