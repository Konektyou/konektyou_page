import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Provider from '@/models/Provider';
import Service from '@/models/Service';
const jwt = require('jsonwebtoken');

export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await params;

    // Fetch all bookings for this client
    const bookings = await Booking.find({ clientId })
      .populate('providerId', 'name email phone')
      .populate('serviceId', 'name description')
      .sort({ createdAt: -1 });

    // Format bookings
    const formattedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject ? booking.toObject() : booking;
      const provider = bookingObj.providerId;
      const service = bookingObj.serviceId;

      return {
        id: bookingObj._id.toString(),
        providerId: provider?._id?.toString() || bookingObj.providerId?.toString(),
        providerName: provider?.name || 'Unknown Provider',
        serviceId: service?._id?.toString() || bookingObj.serviceId?.toString(),
        serviceName: service?.name || 'Service',
        startTime: bookingObj.startTime,
        endTime: bookingObj.endTime,
        duration: bookingObj.duration,
        amount: bookingObj.amount,
        status: bookingObj.status,
        paymentStatus: bookingObj.paymentStatus,
        createdAt: bookingObj.createdAt,
        completedAt: bookingObj.completedAt,
        cancelledAt: bookingObj.cancelledAt,
        rating: bookingObj.rating || null,
        review: bookingObj.review || null
      };
    });

    return NextResponse.json({
      success: true,
      bookings: formattedBookings
    });
  } catch (error) {
    console.error('Error fetching client bookings:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

