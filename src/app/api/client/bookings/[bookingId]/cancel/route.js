import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
const jwt = require('jsonwebtoken');
const Stripe = require('stripe');

export async function POST(request, { params }) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const clientId = decoded.id;

    const { bookingId } = await params;
    const { reason } = await request.json();

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify client owns this booking
    if (booking.clientId.toString() !== clientId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if booking can be cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return NextResponse.json(
        { success: false, message: 'Booking cannot be cancelled in current status' },
        { status: 400 }
      );
    }

    // Process refund if payment was made
    let refundId = null;
    if (booking.paymentStatus === 'paid' && booking.stripePaymentId) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51MAu7gI7BEvOC2zJTYQxB3JsfS5rINOJylLzJuhWTG3p4WAvTRQ1us6Fof8Z2UZEi15rxmAyXTbNnny1stNz4d7200w9BfzrOR');
        
        // Retrieve the payment intent to get the charge ID
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripePaymentId);
        
        if (paymentIntent.latest_charge) {
          // Create refund
          const refund = await stripe.refunds.create({
            charge: paymentIntent.latest_charge,
            amount: Math.round(booking.amount * 100), // Convert to cents
            reason: 'requested_by_customer',
            metadata: {
              bookingId: booking._id.toString(),
              clientId: clientId.toString(),
              reason: reason || 'Client cancellation'
            }
          });
          
          refundId = refund.id;
        }
      } catch (stripeError) {
        console.error('Stripe refund error:', stripeError);
        // Continue with cancellation even if refund fails
        // The admin can process refunds manually if needed
      }
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = 'client';
    if (refundId) {
      booking.paymentStatus = 'refunded';
    }
    if (reason) {
      booking.notes = booking.notes ? `${booking.notes}\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`;
    }
    await booking.save();

    return NextResponse.json({
      success: true,
      message: refundId ? 'Booking cancelled and refund processed' : 'Booking cancelled successfully',
      booking: {
        id: booking._id.toString(),
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        cancelledAt: booking.cancelledAt
      },
      refundId: refundId
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

