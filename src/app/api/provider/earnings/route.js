import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Booking from '@/models/Booking';
import Client from '@/models/Client';
import Service from '@/models/Service';
import AdminSettings from '@/models/AdminSettings';
const jwt = require('jsonwebtoken');

// GET - Fetch earnings summary and payments for the provider
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

    // Get admin settings for commission rate
    const adminSettings = await AdminSettings.getSettings();
    const commissionRate = adminSettings.commissionRate / 100; // Convert percentage to decimal

    // Helper function to calculate provider earnings after commission
    // bookingAmount = provider's set price (what client paid)
    // Commission is deducted from provider earnings, NOT added to client price
    const calculateProviderEarnings = (bookingAmount) => {
      const adminCommission = bookingAmount * commissionRate;
      return bookingAmount - adminCommission;
    };

    // Fetch all payments for this provider
    const payments = await Payment.find({ providerId }).sort({ createdAt: -1 });

    // Fetch all bookings for this provider
    const bookings = await Booking.find({ providerId })
      .populate('clientId', 'name email phone')
      .populate('serviceId', 'name description')
      .sort({ createdAt: -1 });

    // Calculate earnings from bookings
    const activeBookings = bookings.filter(b => ['pending', 'confirmed', 'in-progress'].includes(b.status));
    const completedBookings = bookings.filter(b => b.status === 'completed' && b.paymentStatus === 'paid');
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

    // For active bookings, calculate earnings after commission
    const activeEarnings = activeBookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => {
        // Check if payment already released (use Payment record amount)
        const releasedPayment = payments.find(p => 
          p.bookingId && p.bookingId.toString() === b._id.toString() && p.status === 'completed'
        );
        if (releasedPayment) {
          return sum + (releasedPayment.amount || 0);
        }
        // Otherwise calculate after commission
        return sum + calculateProviderEarnings(b.amount || 0);
      }, 0);

    // For completed bookings, use Payment records if released, otherwise calculate after commission
    const completedEarnings = completedBookings.reduce((sum, b) => {
      // Check if payment already released (use Payment record amount)
      const releasedPayment = payments.find(p => 
        p.bookingId && p.bookingId.toString() === b._id.toString() && p.status === 'completed'
      );
      if (releasedPayment) {
        return sum + (releasedPayment.amount || 0);
      }
      // Otherwise calculate after commission
      return sum + calculateProviderEarnings(b.amount || 0);
    }, 0);

    const cancelledEarnings = cancelledBookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + calculateProviderEarnings(b.amount || 0), 0);

    const totalEarnings = completedEarnings;

    // Format bookings for display
    const formattedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject ? booking.toObject() : booking;
      const client = bookingObj.clientId;
      const service = bookingObj.serviceId;

      // Check if payment already released (use Payment record amount)
      const releasedPayment = payments.find(p => 
        p.bookingId && p.bookingId.toString() === bookingObj._id.toString() && p.status === 'completed'
      );
      
      // Use released payment amount if available, otherwise calculate after commission
      const providerAmount = releasedPayment 
        ? (releasedPayment.amount || 0)
        : calculateProviderEarnings(bookingObj.amount || 0);

      return {
        id: bookingObj._id.toString(),
        clientId: client?._id?.toString() || bookingObj.clientId?.toString(),
        clientName: client?.name || 'Unknown Client',
        serviceId: service?._id?.toString() || bookingObj.serviceId?.toString(),
        serviceName: service?.name || 'Service',
        amount: providerAmount, // Provider earnings after commission
        bookingAmount: bookingObj.amount || 0, // Original booking amount
        status: bookingObj.status,
        paymentStatus: bookingObj.paymentStatus,
        startTime: bookingObj.startTime,
        endTime: bookingObj.endTime,
        duration: bookingObj.duration,
        createdAt: bookingObj.createdAt,
        completedAt: bookingObj.completedAt,
        cancelledAt: bookingObj.cancelledAt,
        rating: bookingObj.rating || null,
        review: bookingObj.review || null,
        isPaymentReleased: !!releasedPayment
      };
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalEarnings: totalEarnings || 0,
        activeEarnings: activeEarnings || 0,
        completedEarnings: completedEarnings || 0,
        cancelledEarnings: cancelledEarnings || 0,
        activeCount: activeBookings.length,
        completedCount: completedBookings.length,
        cancelledCount: cancelledBookings.length
      },
      payments: payments.map(p => ({
        _id: p._id,
        amount: p.amount,
        status: p.status,
        paymentType: p.paymentType,
        description: p.description,
        createdAt: p.createdAt,
        completedAt: p.completedAt
      })),
      bookings: formattedBookings
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

