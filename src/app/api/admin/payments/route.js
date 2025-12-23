import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';
import Client from '@/models/Client';
import Provider from '@/models/Provider';
import Service from '@/models/Service';

// Admin commission rate (e.g., 15%)
const ADMIN_COMMISSION_RATE = 0.15;

export async function GET(request) {
  try {
    await connectToDatabase();

    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all bookings with payment status 'paid' or 'refunded'
    const bookings = await Booking.find({
      paymentStatus: { $in: ['paid', 'refunded'] }
    })
      .populate('clientId', 'name email phone')
      .populate('providerId', 'name email phone city province photo photoPath')
      .populate('serviceId', 'name description')
      .sort({ createdAt: -1 });

    // Fetch all payments
    const payments = await Payment.find({})
      .populate('providerId', 'name')
      .populate('bookingId')
      .sort({ createdAt: -1 });

    // Format transactions from bookings
    const transactions = bookings.map(booking => {
      const bookingObj = booking.toObject ? booking.toObject() : booking;
      const client = bookingObj.clientId;
      const provider = bookingObj.providerId;
      const service = bookingObj.serviceId;

      // Calculate admin commission (15% of booking amount)
      const adminCommission = bookingObj.amount * ADMIN_COMMISSION_RATE;
      const providerEarnings = bookingObj.amount - adminCommission;

      // Find related payment record
      const relatedPayment = payments.find(p => 
        p.bookingId && p.bookingId.toString() === bookingObj._id.toString()
      );

      return {
        id: bookingObj._id.toString(),
        type: bookingObj.paymentStatus === 'refunded' ? 'refund' : 'booking',
        clientId: client?._id?.toString() || bookingObj.clientId?.toString(),
        clientName: client?.name || 'Unknown Client',
        clientEmail: client?.email || '',
        clientPhone: client?.phone || '',
        providerId: provider?._id?.toString() || bookingObj.providerId?.toString(),
        providerName: provider?.name || 'Unknown Provider',
        providerEmail: provider?.email || '',
        providerPhone: provider?.phone || '',
        serviceId: service?._id?.toString() || bookingObj.serviceId?.toString(),
        serviceName: service?.name || 'Service',
        bookingAmount: bookingObj.amount,
        adminCommission: bookingObj.paymentStatus === 'refunded' ? 0 : adminCommission,
        providerEarnings: bookingObj.paymentStatus === 'refunded' ? 0 : providerEarnings,
        status: bookingObj.status,
        paymentStatus: bookingObj.paymentStatus,
        rating: bookingObj.rating || null,
        review: bookingObj.review || null,
        ratedAt: bookingObj.ratedAt || null,
        createdAt: bookingObj.createdAt,
        completedAt: bookingObj.completedAt,
        cancelledAt: bookingObj.cancelledAt,
        paymentReleasedAt: relatedPayment?.completedAt || bookingObj.completedAt || null,
        stripePaymentId: bookingObj.stripePaymentId || null,
        paymentIntentId: bookingObj.paymentIntentId || null
      };
    });

    // Calculate summary statistics
    const totalRevenue = transactions
      .filter(t => t.paymentStatus === 'paid' && t.type === 'booking')
      .reduce((sum, t) => sum + t.bookingAmount, 0);

    const totalAdminCommission = transactions
      .filter(t => t.paymentStatus === 'paid' && t.type === 'booking')
      .reduce((sum, t) => sum + t.adminCommission, 0);

    const totalRefunds = transactions
      .filter(t => t.type === 'refund')
      .reduce((sum, t) => sum + t.bookingAmount, 0);

    const completedBookings = transactions.filter(t => t.status === 'completed').length;
    const paidBookings = transactions.filter(t => t.paymentStatus === 'paid').length;

    return NextResponse.json({
      success: true,
      transactions,
      summary: {
        totalRevenue,
        totalAdminCommission,
        totalRefunds,
        completedBookings,
        paidBookings,
        totalTransactions: transactions.length
      }
    });
  } catch (error) {
    console.error('Error fetching admin payments:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}






