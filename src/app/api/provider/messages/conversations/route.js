import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Message from '@/models/Message';
import Client from '@/models/Client';
import mongoose from 'mongoose';
const jwt = require('jsonwebtoken');

export async function GET(request) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const providerId = decoded.id;

    // Get all unique client IDs that have conversations with this provider
    const conversations = await Message.aggregate([
      {
        $match: { providerId: new mongoose.Types.ObjectId(providerId) }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$clientId',
          lastMessage: { $first: '$text' },
          lastMessageTime: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$read', false] }, { $eq: ['$sender', 'client'] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);

    // Fetch client details for each conversation
    const conversationsWithClientInfo = await Promise.all(
      conversations.map(async (conv) => {
        const client = await Client.findById(conv._id).select('name email');
        if (!client) return null;

        return {
          id: conv._id.toString(),
          clientId: conv._id.toString(),
          clientName: client.name || client.email,
          clientPhoto: null,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount: conv.unreadCount
        };
      })
    );

    // Filter out null values (clients that might have been deleted)
    const validConversations = conversationsWithClientInfo.filter(conv => conv !== null);

    return NextResponse.json({
      success: true,
      conversations: validConversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

