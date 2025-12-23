import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Message from '@/models/Message';
import Client from '@/models/Client';
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const providerId = decoded.id;
    const { clientId } = await params;

    // Fetch messages between provider and client
    const messages = await Message.find({
      providerId: new mongoose.Types.ObjectId(providerId),
      clientId: new mongoose.Types.ObjectId(clientId)
    }).sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        providerId: new mongoose.Types.ObjectId(providerId),
        clientId: new mongoose.Types.ObjectId(clientId),
        sender: 'client',
        read: false
      },
      {
        $set: { read: true, readAt: new Date() }
      }
    );

    // Fetch client info
    const client = await Client.findById(clientId).select('name email photoPath');
    let clientPhoto = null;
    if (client?.photoPath) {
      clientPhoto = `/api/images/${client.photoPath.replace(/^src\/images\//, '')}`;
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
      client: client ? {
        id: client._id.toString(),
        name: client.name || client.email,
        photo: clientPhoto
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

