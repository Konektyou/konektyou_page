import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Client from '@/models/Client';
import Provider from '@/models/Provider';
import Service from '@/models/Service';

export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { bookingId } = params;

    if (!bookingId) {
      return NextResponse.json({ success: false, message: 'Booking ID is required' }, { status: 400 });
    }

    // Fetch booking with all details
    const booking = await Booking.findById(bookingId)
      .populate('clientId', 'name email phone')
      .populate('providerId', 'name email phone city province photo photoPath')
      .populate('serviceId', 'name description basePrice unit categoryId');

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    const bookingObj = booking.toObject ? booking.toObject() : booking;
    const client = bookingObj.clientId;
    const provider = bookingObj.providerId;
    const service = bookingObj.serviceId;

    // Fetch provider services
    const providerServices = await Service.find({ providerId: provider?._id || bookingObj.providerId })
      .populate('categoryId', 'name');

    // Fetch client bookings
    const clientBookings = await Booking.find({ clientId: client?._id || bookingObj.clientId })
      .populate('providerId', 'name')
      .populate('serviceId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Format provider services
    const formattedServices = providerServices.map(service => {
      const serviceObj = service.toObject ? service.toObject() : service;
      return {
        id: serviceObj._id.toString(),
        name: serviceObj.name,
        description: serviceObj.description || '',
        category: serviceObj.categoryId?.name || 'Uncategorized',
        basePrice: serviceObj.basePrice,
        unit: serviceObj.unit || 'hour',
        active: serviceObj.active !== false
      };
    });

    // Format client bookings
    const formattedClientBookings = clientBookings.map(booking => {
      const bookingObj = booking.toObject ? booking.toObject() : booking;
      return {
        id: bookingObj._id.toString(),
        providerName: bookingObj.providerId?.name || 'Unknown Provider',
        serviceName: bookingObj.serviceId?.name || 'Service',
        startTime: bookingObj.startTime,
        duration: bookingObj.duration,
        amount: bookingObj.amount,
        status: bookingObj.status,
        paymentStatus: bookingObj.paymentStatus,
        rating: bookingObj.rating || null
      };
    });

    // Format main booking
    const formattedBooking = {
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
      providerPhoto: provider?.photo || provider?.photoPath || '',
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
      review: bookingObj.review || null,
      ratedAt: bookingObj.ratedAt || null,
      providerServices: formattedServices,
      clientBookings: formattedClientBookings
    };

    return NextResponse.json({
      success: true,
      booking: formattedBooking
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch booking details' },
      { status: 500 }
    );
  }
}

