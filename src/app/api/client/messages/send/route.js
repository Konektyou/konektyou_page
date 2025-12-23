import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Message from '@/models/Message';
const jwt = require('jsonwebtoken');
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    if (!token || token.trim() === '') {
      return NextResponse.json({ success: false, message: 'Token is required' }, { status: 401 });
    }

    // Read request body once
    const body = await request.json();
    const { providerId, text } = body;

    let clientId;
    
    // Try to verify as JWT first
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      clientId = decoded.id;
    } catch (jwtError) {
      // If JWT verification fails, check if it's a hex token (old format)
      // For hex tokens, get clientId from header or request body
      const clientIdFromHeader = request.headers.get('x-client-id');
      const clientIdFromRequest = clientIdFromHeader || body.clientId;
      
      if (!clientIdFromRequest) {
        return NextResponse.json(
          { success: false, message: 'Invalid token. Please login again.' },
          { status: 401 }
        );
      }
      
      // Verify client exists and is active
      const Client = (await import('@/models/Client')).default;
      const client = await Client.findById(clientIdFromRequest);
      if (!client || !client.isActive || client.isBanned) {
        return NextResponse.json(
          { success: false, message: 'Invalid client or account is inactive' },
          { status: 401 }
        );
      }
      
      clientId = clientIdFromRequest;
    }

    if (!providerId || !text || !text.trim()) {
      return NextResponse.json(
        { success: false, message: 'Provider ID and message text are required' },
        { status: 400 }
      );
    }

    const message = await Message.create({
      providerId: new mongoose.Types.ObjectId(providerId),
      clientId: new mongoose.Types.ObjectId(clientId),
      sender: 'client',
      text: text.trim()
    });

    const messageData = {
      id: message._id.toString(),
      text: message.text,
      sender: message.sender,
      timestamp: message.createdAt,
      read: message.read,
      providerId: providerId,
      clientId: clientId
    };

    // Emit Socket.io event to notify both client and provider
    if (global.io) {
      const roomId = `conversation:${providerId}:${clientId}`;
      console.log('📤 Emitting message to Socket.io room:', roomId);
      console.log('📤 Message data:', messageData);
      
      // Get room size for debugging
      const room = global.io.sockets.adapter.rooms.get(roomId);
      const roomSize = room ? room.size : 0;
      console.log(`👥 Room ${roomId} has ${roomSize} connected clients`);
      
      global.io.to(roomId).emit('newMessage', messageData);
      // Also emit to user-specific rooms for real-time updates
      global.io.to(`user:provider:${providerId}`).emit('newMessage', messageData);
      global.io.to(`user:client:${clientId}`).emit('newMessage', messageData);
      
      console.log('✅ Message emitted successfully');
    } else {
      console.error('❌ Socket.io not initialized (global.io is null)');
    }

    return NextResponse.json({
      success: true,
      message: messageData
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

