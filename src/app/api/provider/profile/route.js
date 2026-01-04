import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Provider from '@/models/Provider';

const jwt = require('jsonwebtoken');

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Verify the provider ID matches the token
    if (providerId !== decoded.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const provider = await Provider.findById(providerId).select('-password');

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: provider._id.toString(),
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        city: provider.city,
        province: provider.province,
        serviceType: provider.serviceType,
        experience: provider.experience,
        businessName: provider.businessName,
        profileStatus: provider.profileStatus,
        verificationStatus: provider.verificationStatus,
        rejectionReason: provider.rejectionReason,
        photoPath: provider.photoPath,
        location: provider.location || null,
        createdAt: provider.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

