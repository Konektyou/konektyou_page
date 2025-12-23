// Custom Next.js server with Socket.io
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Allow all origins for development
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  // Store io instance globally so API routes can access it
  global.io = io;

  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);
    console.log('📊 Total connected clients:', io.sockets.sockets.size);

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
        const room = io.sockets.adapter.rooms.get(roomId);
        const roomSize = room ? room.size : 0;
        console.log(`🚪 Socket ${socket.id} joined conversation room: ${roomId} (${roomSize} clients in room)`);
      } else {
        console.warn('⚠️ joinConversation called with missing data:', data);
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

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log('> Socket.io server initialized');
      console.log('> Socket.io path: /socket.io/');
      console.log('> Test connection at: http://localhost:3000/socket.io/');
    });
});

