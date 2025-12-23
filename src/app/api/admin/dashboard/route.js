import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Provider from '@/models/Provider';
import Business from '@/models/Business';
import Client from '@/models/Client';
import Service from '@/models/Service';

export async function GET(request) {
  try {
    await connectToDatabase();

    // Check authorization (basic check - you can enhance this with JWT)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Count total verified users (provider + business + client)
    const verifiedProviders = await Provider.countDocuments({ 
      isVerified: true,
      isActive: true,
      isBanned: false
    });
    
    const verifiedBusinesses = await Business.countDocuments({ 
      isVerified: true,
      isActive: true,
      isBanned: false
    });
    
    const verifiedClients = await Client.countDocuments({ 
      isActive: true,
      isBanned: false
    });

    const totalVerifiedUsers = verifiedProviders + verifiedBusinesses + verifiedClients;

    // Count active verified providers
    const activeVerifiedProviders = await Provider.countDocuments({
      isVerified: true,
      isActive: true,
      isBanned: false,
      profileStatus: 'APPROVED',
      verificationStatus: 'APPROVED'
    });

    // Count total services
    const totalServices = await Service.countDocuments({ active: true });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalVerifiedUsers,
        activeProviders: activeVerifiedProviders,
        totalServices: totalServices
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

