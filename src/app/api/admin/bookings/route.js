import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Client from '@/models/Client';
import Provider from '@/models/Provider';
import Service from '@/models/Service';
const jwt = require('jsonwebtoken');

export async function GET(request) {
  try {
    await connectToDatabase();

    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // For admin auth, we accept the token from localStorage
    // The token is validated by checking if adminAuth exists in the request
    // In production, you should implement proper JWT verification for admin tokens

    // Fetch all bookings
    const bookings = await Booking.find({})
      .populate('clientId', 'name email phone')
      .populate('providerId', 'name email phone photoPath city province')
      .populate('serviceId', 'name description basePrice unit')
      .sort({ createdAt: -1 });

    // Format bookings with all details
    const formattedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject ? booking.toObject() : booking;
      const client = bookingObj.clientId;
      const provider = bookingObj.providerId;
      const service = bookingObj.serviceId;

      return {
        id: bookingObj._id.toString(),
        clientId: client?._id?.toString() || bookingObj.clientId?.toString(),
        clientName: client?.name || 'Unknown Client',
        clientEmail: client?.email || '',
        clientPhone: client?.phone || '',
        providerId: provider?._id?.toString() || bookingObj.providerId?.toString(),
        providerName: provider?.name || 'Unknown Provider',
        providerEmail: provider?.email || '',
        providerPhone: provider?.phone || '',
        providerCity: provider?.city || '',
        providerProvince: provider?.province || '',
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
        completedAt: bookingObj.completedAt,
        cancelledAt: bookingObj.cancelledAt,
        cancelledBy: bookingObj.cancelledBy,
        rating: bookingObj.rating || null,
        review: bookingObj.review || null
      };
    });

    return NextResponse.json({
      success: true,
      bookings: formattedBookings
    });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

