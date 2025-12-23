import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
const jwt = require('jsonwebtoken');

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
    const { rating, review } = await request.json();

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

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

    // Check if booking can be completed
    if (!['confirmed', 'in-progress'].includes(booking.status)) {
      return NextResponse.json(
        { success: false, message: 'Booking cannot be completed in current status' },
        { status: 400 }
      );
    }

    // Check if already rated
    if (booking.rating) {
      return NextResponse.json(
        { success: false, message: 'Booking already rated' },
        { status: 400 }
      );
    }

    // Update booking
    booking.status = 'completed';
    booking.completedAt = new Date();
    booking.rating = rating;
    booking.review = review || null;
    booking.ratedAt = new Date();
    await booking.save();

    return NextResponse.json({
      success: true,
      message: 'Booking completed successfully',
      booking: {
        id: booking._id.toString(),
        status: booking.status,
        rating: booking.rating,
        completedAt: booking.completedAt
      }
    });
  } catch (error) {
    console.error('Error completing booking:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

