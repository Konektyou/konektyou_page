import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Provider from '@/models/Provider';

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const profileStatus = searchParams.get('profileStatus');
    const search = searchParams.get('search');

    // Build query
    const query = {};

    // Filter by profile status
    if (profileStatus && profileStatus !== 'all') {
      query.profileStatus = profileStatus;
    } else {
      // If no specific status, show all except INCOMPLETE
      query.profileStatus = { $ne: 'INCOMPLETE' };
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const providers = await Provider.find(query)
      .select('-password')
      .sort({ updatedAt: -1 })
      .limit(100);

    const formattedProviders = providers.map(provider => ({
      id: provider._id.toString(),
      name: provider.name,
      email: provider.email,
      phone: provider.phone || '',
      city: provider.city || '',
      province: provider.province || '',
      serviceType: provider.serviceType || '',
      experience: provider.experience || '',
      businessName: provider.businessName || '',
      profileStatus: provider.profileStatus,
      verificationStatus: provider.verificationStatus,
      rejectionReason: provider.rejectionReason,
      photoPath: provider.photoPath,
      documentsCount: provider.documents?.length || 0,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt
    }));

    return NextResponse.json({
      success: true,
      providers: formattedProviders
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

