import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Message from '@/models/Message';
import Provider from '@/models/Provider';
const jwt = require('jsonwebtoken');
import mongoose from 'mongoose';

export async function GET(request, { params }) {
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

    let clientId;
    
    // Try to verify as JWT first
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      clientId = decoded.id;
    } catch (jwtError) {
      // If JWT verification fails, check if it's a hex token (old format)
      // For hex tokens, get clientId from header or query
      const clientIdFromHeader = request.headers.get('x-client-id');
      const url = new URL(request.url);
      const clientIdFromQuery = url.searchParams.get('clientId');
      const clientIdFromRequest = clientIdFromHeader || clientIdFromQuery;
      
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
    const { providerId } = await params;

    // Fetch messages between client and provider
    const messages = await Message.find({
      providerId: new mongoose.Types.ObjectId(providerId),
      clientId: new mongoose.Types.ObjectId(clientId)
    }).sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        providerId: new mongoose.Types.ObjectId(providerId),
        clientId: new mongoose.Types.ObjectId(clientId),
        sender: 'provider',
        read: false
      },
      {
        $set: { read: true, readAt: new Date() }
      }
    );

    // Fetch provider info
    const provider = await Provider.findById(providerId).select('name email photoPath');
    let providerPhoto = null;
    if (provider?.photoPath) {
      providerPhoto = `/api/images/${provider.photoPath.replace(/^src\/images\//, '')}`;
    }

    return NextResponse.json({
      success: true,
      messages: messages.map(msg => ({
        id: msg._id.toString(),
        text: msg.text,
        sender: msg.sender,
        timestamp: msg.createdAt,
        read: msg.read
      })),
      provider: provider ? {
        id: provider._id.toString(),
        name: provider.name || provider.email,
        photo: providerPhoto,
        status: 'available'
      } : null
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

