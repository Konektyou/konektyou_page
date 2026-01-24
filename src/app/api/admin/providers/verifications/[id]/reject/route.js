import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Provider from '@/models/Provider';

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

    // Await params for Next.js 15
    const { id } = await params;
    const { reason } = await request.json();

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { success: false, message: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    const provider = await Provider.findById(id);

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Update provider status
    provider.profileStatus = 'REJECTED';
    provider.verificationStatus = 'REJECTED';
    provider.rejectionReason = reason.trim();
    provider.isVerified = false;

    await provider.save();

    // TODO: Send rejection email to provider with reason
    // await sendProviderRejectionEmail(provider.email, provider.name, reason);

    return NextResponse.json({
      success: true,
      message: 'Provider profile rejected successfully',
      provider: {
        id: provider._id.toString(),
        profileStatus: provider.profileStatus,
        verificationStatus: provider.verificationStatus,
        rejectionReason: provider.rejectionReason
      }
    });
  } catch (error) {
    console.error('Error rejecting provider:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

