import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';

export async function POST(request) {
  try {
    // Get admin data from request body (sent from client)
    const { adminId, username } = await request.json().catch(() => ({}));
    
    if (adminId && username) {
      try {
        // Log logout activity
        await connectToDatabase();
        await ActivityLog.create({
          adminId: adminId,
          username: username,
          action: 'logout',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          success: true,
          message: 'Logout successful'
        });
      } catch (logError) {
        console.error('Error logging logout:', logError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed', error: error.message },
      { status: 500 }
    );
  }
}

