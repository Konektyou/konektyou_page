import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const session = JSON.parse(sessionCookie.value);
    
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const skip = parseInt(searchParams.get('skip')) || 0;
    const action = searchParams.get('action'); // login, logout, failed_login
    const adminId = searchParams.get('adminId');

    // Build query
    const query = {};
    if (action) {
      query.action = action;
    }
    if (adminId) {
      query.adminId = adminId;
    }

    // Fetch activity logs
    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await ActivityLog.countDocuments(query);

    return NextResponse.json({
      success: true,
      logs,
      total,
      limit,
      skip
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch activity logs', error: error.message },
      { status: 500 }
    );
  }
}

