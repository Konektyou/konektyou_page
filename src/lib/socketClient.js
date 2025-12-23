// Socket.io client utility for frontend
import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (typeof window === 'undefined') return null;
  
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log('🔌 Initializing Socket.io connection to:', socketUrl);
    console.log('🔌 Socket.io path:', '/socket.io/');
    
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      autoConnect: true,
      timeout: 20000
    });

    // Connection status logging
    socket.on('connect', () => {
      console.log('✅ Socket.io CONNECTED - Socket ID:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.io DISCONNECTED - Reason:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.io CONNECTION ERROR:', error.message);
      console.error('💡 CRITICAL: You must restart your server!');
      console.error('💡 Steps:');
      console.error('   1. Stop server (Ctrl+C in terminal)');
      console.error('   2. Run: npm run dev');
      console.error('   3. Look for "Socket.io server initialized" in terminal');
      console.error('   4. Refresh this page');
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket.io RECONNECTED after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_attempt', () => {
      console.log('🔄 Attempting to reconnect Socket.io...');
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ Socket.io RECONNECTION FAILED');
    });
  }
  
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

