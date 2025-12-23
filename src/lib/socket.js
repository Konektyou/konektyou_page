// Socket.io server setup for Next.js
import { Server } from 'socket.io';

let io = null;

export function initSocketIO(server) {
  if (io) {
    return io;
  }

  io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    path: '/api/socket'
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle authentication
    socket.on('authenticate', (data) => {
      const { userId, userType } = data;
      if (userId) {
        socket.userId = userId;
        socket.userType = userType; // 'client' or 'provider'
        socket.join(`user:${userType}:${userId}`);
        console.log(`User ${userId} (${userType}) authenticated and joined room`);
      }
    });

    // Handle joining a conversation room
    socket.on('joinConversation', (data) => {
      const { providerId, clientId } = data;
      if (providerId && clientId) {
        const roomId = `conversation:${providerId}:${clientId}`;
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined conversation room: ${roomId}`);
      }
    });

    // Handle leaving a conversation room
    socket.on('leaveConversation', (data) => {
      const { providerId, clientId } = data;
      if (providerId && clientId) {
        const roomId = `conversation:${providerId}:${clientId}`;
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left conversation room: ${roomId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocketIO first.');
  }
  return io;
}

