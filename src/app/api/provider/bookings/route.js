import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Client from '@/models/Client';
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
    const providerId = decoded.id;

    // Fetch all bookings for this provider
    const bookings = await Booking.find({ providerId })
      .populate('clientId', 'name email phone')
      .populate('serviceId', 'name description basePrice unit')
      .sort({ startTime: 1 });

    // Format bookings
    const formattedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject ? booking.toObject() : booking;
      const client = bookingObj.clientId;
      const service = bookingObj.serviceId;

      return {
        id: bookingObj._id.toString(),
        clientId: client?._id?.toString() || bookingObj.clientId?.toString(),
        clientName: client?.name || 'Unknown Client',
        clientEmail: client?.email || '',
        clientPhone: client?.phone || '',
        serviceId: service?._id?.toString() || bookingObj.serviceId?.toString(),
        serviceName: service?.name || 'Service',
        serviceDescription: service?.description || '',
        startTime: bookingObj.startTime,
        endTime: bookingObj.endTime,
        duration: bookingObj.duration,
        workLocation: bookingObj.workLocation,
        amount: bookingObj.amount,
        status: bookingObj.status,
        paymentStatus: bookingObj.paymentStatus,
        notes: bookingObj.notes,
        createdAt: bookingObj.createdAt,
        completedAt: bookingObj.completedAt
      };
    });

    return NextResponse.json({
      success: true,
      bookings: formattedBookings
    });
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

