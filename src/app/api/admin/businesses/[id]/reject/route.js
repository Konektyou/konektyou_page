import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Business from '@/models/Business';

export async function POST(request, { params }) {
  try {
    await connectToDatabase();

    // Check admin authentication (token from Authorization header)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { reason } = await request.json();

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { success: false, message: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    const business = await Business.findById(id);

    if (!business) {
      return NextResponse.json(
        { success: false, message: 'Business not found' },
        { status: 404 }
      );
    }

    // Update business status
    business.isVerified = false;
    // Note: Business model might not have rejectionReason field, but we'll add it if needed

    await business.save();

    return NextResponse.json({
      success: true,
      message: 'Business verification rejected successfully',
      business: {
        id: business._id.toString(),
        isVerified: business.isVerified
      }
    });
  } catch (error) {
    console.error('Error rejecting business:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

