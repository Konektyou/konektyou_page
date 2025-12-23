import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Provider from '@/models/Provider';
const jwt = require('jsonwebtoken');

export async function GET(request) {
  try {
    await connectToDatabase();

    // Get token from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const providerId = decoded.id;

    // Fetch provider data
    const provider = await Provider.findById(providerId).select('-password');
    if (!provider) {
      return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // TODO: When Booking model is created, fetch real data
    // For now, return 0 for all booking-related stats
    const todayBookingsCount = 0;
    const totalEarnings = 0;
    const completedJobsCount = 0;
    const todayBookings = [];

    // Calculate pending approval status
    // If profileStatus is PENDING_REVIEW or verificationStatus is PENDING, show 1, else 0
    const pendingApproval = 
      (provider.profileStatus === 'PENDING_REVIEW' || provider.verificationStatus === 'PENDING') ? 1 : 0;

    // Get provider name from profile
    const providerName = provider.name || 'Provider';

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          todayBookings: todayBookingsCount,
          totalEarnings: totalEarnings,
          completedJobs: completedJobsCount,
          pendingApproval: pendingApproval
        },
        todayBookings: todayBookings,
        profile: {
          name: providerName,
          serviceType: provider.serviceType || '',
          city: provider.city || '',
          province: provider.province || ''
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

