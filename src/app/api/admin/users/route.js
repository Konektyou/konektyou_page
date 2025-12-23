import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Client from '@/models/Client';
import Business from '@/models/Business';
import Provider from '@/models/Provider';

export async function GET(request) {
  try {
    // Note: Admin authentication is handled client-side via localStorage
    // For production, you may want to add server-side token validation here
    
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'client', 'business', 'provider', or null for all
    const search = searchParams.get('search') || ''; // Search by name or email
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    let users = [];
    let total = 0;

    if (role === 'client') {
      // Fetch clients only
      const clients = await Client.find(searchQuery)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      total = await Client.countDocuments(searchQuery);

      users = clients.map((client) => ({
        id: client._id.toString(),
        role: 'client',
        name: client.name,
        email: client.email,
        phone: client.phone || 'N/A',
        city: client.city || 'N/A',
        province: client.province || 'N/A',
        isActive: client.isActive,
        isBanned: client.isBanned,
        banReason: client.banReason,
        lastLogin: client.lastLogin,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt
      }));
    } else if (role === 'business') {
      // Fetch businesses only
      const businesses = await Business.find(searchQuery)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      total = await Business.countDocuments(searchQuery);

      users = businesses.map((business) => ({
        id: business._id.toString(),
        role: 'business',
        name: business.name,
        businessName: business.businessName || 'N/A',
        email: business.email,
        phone: business.phone || 'N/A',
        city: business.city || 'N/A',
        province: business.province || 'N/A',
        isVerified: business.isVerified,
        isActive: business.isActive,
        isBanned: business.isBanned,
        banReason: business.banReason,
        lastLogin: business.lastLogin,
        createdAt: business.createdAt,
        updatedAt: business.updatedAt
      }));
    } else if (role === 'provider') {
      // Fetch providers only
      const providers = await Provider.find(searchQuery)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      total = await Provider.countDocuments(searchQuery);

      users = providers.map((provider) => ({
        id: provider._id.toString(),
        role: 'provider',
        name: provider.name,
        email: provider.email,
        phone: provider.phone || 'N/A',
        serviceType: provider.serviceType || 'N/A',
        city: provider.area || 'N/A',
        profileStatus: provider.profileStatus || 'INCOMPLETE',
        verificationStatus: provider.verificationStatus || 'NOT_SUBMITTED',
        isVerified: provider.isVerified,
        isActive: provider.isActive,
        isBanned: provider.isBanned,
        banReason: provider.banReason,
        documentsCount: provider.documents?.length || 0,
        lastLogin: provider.lastLogin,
        createdAt: provider.createdAt,
        updatedAt: provider.updatedAt
      }));
    } else {
      // Fetch all users
      const [clients, businesses, providers] = await Promise.all([
        Client.find(searchQuery)
          .select('-password -resetPasswordToken -resetPasswordExpires')
          .sort({ createdAt: -1 })
          .lean(),
        Business.find(searchQuery)
          .select('-password -resetPasswordToken -resetPasswordExpires')
          .sort({ createdAt: -1 })
          .lean(),
        Provider.find(searchQuery)
          .select('-password -resetPasswordToken -resetPasswordExpires')
          .sort({ createdAt: -1 })
          .lean()
      ]);

      // Combine and format all users
      const allUsers = [
        ...clients.map((client) => ({
          id: client._id.toString(),
          role: 'client',
          name: client.name,
          email: client.email,
          phone: client.phone || 'N/A',
          city: client.city || 'N/A',
          province: client.province || 'N/A',
          isActive: client.isActive,
          isBanned: client.isBanned,
          banReason: client.banReason,
          lastLogin: client.lastLogin,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt
        })),
        ...businesses.map((business) => ({
          id: business._id.toString(),
          role: 'business',
          name: business.name,
          businessName: business.businessName || 'N/A',
          email: business.email,
          phone: business.phone || 'N/A',
          city: business.city || 'N/A',
          province: business.province || 'N/A',
          isVerified: business.isVerified,
          isActive: business.isActive,
          isBanned: business.isBanned,
          banReason: business.banReason,
          lastLogin: business.lastLogin,
          createdAt: business.createdAt,
          updatedAt: business.updatedAt
        })),
        ...providers.map((provider) => ({
          id: provider._id.toString(),
          role: 'provider',
          name: provider.name,
          email: provider.email,
          phone: provider.phone || 'N/A',
          serviceType: provider.serviceType || 'N/A',
          city: provider.area || 'N/A',
          profileStatus: provider.profileStatus || 'INCOMPLETE',
          verificationStatus: provider.verificationStatus || 'NOT_SUBMITTED',
          isVerified: provider.isVerified,
          isActive: provider.isActive,
          isBanned: provider.isBanned,
          banReason: provider.banReason,
          documentsCount: provider.documents?.length || 0,
          lastLogin: provider.lastLogin,
          createdAt: provider.createdAt,
          updatedAt: provider.updatedAt
        }))
      ];

      // Sort by createdAt (newest first)
      allUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      total = allUsers.length;
      users = allUsers.slice(skip, skip + limit);
    }

    // Get counts for each role
    const [clientCount, businessCount, providerCount] = await Promise.all([
      Client.countDocuments(),
      Business.countDocuments(),
      Provider.countDocuments()
    ]);

    return NextResponse.json({
      success: true,
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      counts: {
        all: clientCount + businessCount + providerCount,
        client: clientCount,
        business: businessCount,
        provider: providerCount
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users', error: error.message },
      { status: 500 }
    );
  }
}

