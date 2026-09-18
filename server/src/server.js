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

// Socket.io Event Handling
io.on('connection', (socket) => {
  console.log(`\x1b[35m[SOCKET CONNECTED]\x1b[0m Client ID: ${socket.id}`);

  // Send current queue state immediately upon connection
  socket.emit('INITIAL_STATE', {
    clinic: db.getClinic(),
    queue: db.getQueueTokens(),
    analytics: db.getAnalytics()
  });

  socket.on('disconnect', () => {
    console.log(`\x1b[33m[SOCKET DISCONNECTED]\x1b[0m Client ID: ${socket.id}`);
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Seed data check
seedInitialData();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
  =============================================================
  🏥 HOSPITAL APPOINTMENT & QUEUE MANAGEMENT SYSTEM (BACKEND)
  =============================================================
  🚀 Server Running:   http://localhost:${PORT}
  📡 WebSocket Ready:  Port ${PORT} (Socket.io)
  📑 REST API:         http://localhost:${PORT}/api
  📊 Analytics:        http://localhost:${PORT}/api/analytics
  =============================================================
  `);
});
