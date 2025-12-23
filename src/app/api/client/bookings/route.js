import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Provider from '@/models/Provider';
import Service from '@/models/Service';
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
    const clientId = decoded.id;

    // Fetch all bookings for this client
    const bookings = await Booking.find({ clientId })
      .populate('providerId', 'name email phone photoPath')
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
        workLocation: bookingObj.workLocation,
        amount: bookingObj.amount,
        status: bookingObj.status,
        paymentStatus: bookingObj.paymentStatus,
        notes: bookingObj.notes,
        createdAt: bookingObj.createdAt,
        completedAt: bookingObj.completedAt,
        rating: bookingObj.rating || null,
        review: bookingObj.review || null,
        cancelledAt: bookingObj.cancelledAt || null,
        cancelledBy: bookingObj.cancelledBy || null
      };
    });

    return NextResponse.json({
      success: true,
      bookings: formattedBookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

