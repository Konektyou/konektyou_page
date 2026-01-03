import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';
import Provider from '@/models/Provider';
import AdminSettings from '@/models/AdminSettings';

// POST - Release payments for eligible bookings
export async function POST(request) {
  try {
    await connectToDatabase();

    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { bookingIds } = await request.json();

    // If specific booking IDs provided, release only those
    // Otherwise, release all eligible payments
    let query = {
      status: 'completed',
      paymentStatus: 'paid'
    };

    if (bookingIds && Array.isArray(bookingIds) && bookingIds.length > 0) {
      query._id = { $in: bookingIds };
    }

    const bookings = await Booking.find(query);

    if (bookings.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No eligible bookings found for payment release'
      }, { status: 404 });
    }

    // Get admin settings for commission rate
    const adminSettings = await AdminSettings.getSettings();
    const commissionRate = adminSettings.commissionRate / 100;

    // Helper function to check if payment can be released (7 days after completion)
    const canReleasePayment = (completedAt) => {
      if (!completedAt) return false;
      const completedDate = new Date(completedAt);
      const today = new Date();
      const daysDiff = Math.floor((today - completedDate) / (1000 * 60 * 60 * 24));
      return daysDiff >= 7;
    };

    const releasedPayments = [];
    const failedPayments = [];

    for (const booking of bookings) {
      // Check if eligible for release
      if (!canReleasePayment(booking.completedAt)) {
        failedPayments.push({
          bookingId: booking._id.toString(),
          reason: 'Booking completed less than 7 days ago'
        });
        continue;
      }

      // Check if payment already released
      const existingPayment = await Payment.findOne({
        bookingId: booking._id,
        status: 'completed'
      });

      if (existingPayment) {
        failedPayments.push({
          bookingId: booking._id.toString(),
          reason: 'Payment already released'
        });
        continue;
      }

      try {
        // Calculate provider earnings (after commission deduction)
        // booking.amount = provider's set price (what client paid)
        // Commission is deducted from provider earnings, NOT added to client price
        const adminCommission = booking.amount * commissionRate;
        const providerEarnings = booking.amount - adminCommission;

        // Find or create payment record
        let payment = await Payment.findOne({
          bookingId: booking._id,
          providerId: booking.providerId
        });

        if (payment) {
          // Update existing payment
          payment.amount = providerEarnings;
          payment.status = 'completed';
          payment.completedAt = new Date();
          payment.paymentType = 'payout';
          payment.description = `Payment released for completed booking. Admin commission: ${adminSettings.commissionRate}%`;
        } else {
          // Create new payment record
          payment = await Payment.create({
            providerId: booking.providerId,
            bookingId: booking._id,
            serviceId: booking.serviceId,
            amount: providerEarnings,
            status: 'completed',
            paymentType: 'payout',
            completedAt: new Date(),
            description: `Payment released for completed booking. Admin commission: ${adminSettings.commissionRate}%`
          });
        }

        releasedPayments.push({
          bookingId: booking._id.toString(),
          paymentId: payment._id.toString(),
          amount: providerEarnings,
          adminCommission: adminCommission
        });
      } catch (error) {
        console.error(`Error releasing payment for booking ${booking._id}:`, error);
        failedPayments.push({
          bookingId: booking._id.toString(),
          reason: error.message || 'Failed to release payment'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Released ${releasedPayments.length} payment(s) successfully`,
      releasedPayments,
      failedPayments,
      summary: {
        totalReleased: releasedPayments.length,
        totalFailed: failedPayments.length,
        totalAmountReleased: releasedPayments.reduce((sum, p) => sum + p.amount, 0)
      }
    });
  } catch (error) {
    console.error('Error releasing payments:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

