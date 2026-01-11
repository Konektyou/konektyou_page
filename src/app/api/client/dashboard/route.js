import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Provider from '@/models/Provider';
const jwt = require('jsonwebtoken');

export async function GET(request) {
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
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      clientId = decoded.id;
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, message: 'Invalid token. Please login again.' },
        { status: 401 }
      );
    }

    // Get active bookings count (pending, confirmed, in-progress)
    const activeBookingsCount = await Booking.countDocuments({
      clientId,
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    });

    // Get total bookings count
    const totalBookingsCount = await Booking.countDocuments({ clientId });

    // Get unique providers (saved providers - providers the client has booked with)
    const uniqueProviders = await Booking.distinct('providerId', { clientId });
    const savedProvidersCount = uniqueProviders.length;

    // Get reviews count (bookings where client has left a rating)
    const reviewsCount = await Booking.countDocuments({
      clientId,
      rating: { $ne: null }
    });

    // Get recent bookings (last 5)
    const recentBookings = await Booking.find({ clientId })
      .populate('providerId', 'name email phone photoPath')
      .populate('serviceId', 'name description')
      .sort({ createdAt: -1 })
      .limit(5);

    // Format recent bookings
    const formattedRecentBookings = recentBookings.map(booking => ({
      id: booking._id.toString(),
      provider: booking.providerId?.name || 'Unknown Provider',
      providerPhoto: booking.providerId?.photoPath || null,
      service: booking.serviceId?.name || 'Service',
      date: new Date(booking.startTime).toLocaleDateString('en-CA'),
      time: new Date(booking.startTime).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      status: booking.status,
      amount: booking.amount
    }));

    return NextResponse.json({
      success: true,
      stats: {
        activeBookings: activeBookingsCount,
        totalBookings: totalBookingsCount,
        savedProviders: savedProvidersCount,
        myReviews: reviewsCount
      },
      recentBookings: formattedRecentBookings
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard data', error: error.message },
      { status: 500 }
    );
  }
}

