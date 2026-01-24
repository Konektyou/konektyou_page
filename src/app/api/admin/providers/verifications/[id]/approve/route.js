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

    const provider = await Provider.findById(id);

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Update provider status
    provider.profileStatus = 'APPROVED';
    provider.verificationStatus = 'APPROVED';
    provider.isVerified = true;

    await provider.save();

    // TODO: Send approval email to provider
    // await sendProviderApprovalEmail(provider.email, provider.name);

    return NextResponse.json({
      success: true,
      message: 'Provider profile approved successfully',
      provider: {
        id: provider._id.toString(),
        profileStatus: provider.profileStatus,
        verificationStatus: provider.verificationStatus
      }
    });
  } catch (error) {
    console.error('Error approving provider:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

