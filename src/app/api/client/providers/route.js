import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Provider from '@/models/Provider';
import Service from '@/models/Service';
import ServiceCategory from '@/models/ServiceCategory';

export async function GET(request) {
  try {
    await connectToDatabase();

    // Fetch all active, verified providers who can work
    const providers = await Provider.find({
      isActive: true,
      isBanned: false,
      isVerified: true,
      profileStatus: 'APPROVED',
      verificationStatus: 'APPROVED'
    }).select('-password -resetPasswordToken -resetPasswordExpires').sort({ createdAt: -1 });

    // Fetch services for all providers
    const providerIds = providers.map(p => p._id);
    const services = await Service.find({
      providerId: { $in: providerIds },
      active: true
    });

    // Group services by providerId
    const servicesByProvider = {};
    services.forEach(service => {
      const providerId = service.providerId.toString();
      if (!servicesByProvider[providerId]) {
        servicesByProvider[providerId] = [];
      }
      servicesByProvider[providerId].push(service);
    });

    // Fetch all service categories for filter dropdown
    const categories = await ServiceCategory.find({ isActive: true }).sort({ name: 1 });

    // Combine providers with their services
    const providersWithServices = providers.map(provider => {
      const providerObj = provider.toObject ? provider.toObject() : provider;
      const providerId = providerObj._id.toString();
      
      // Get services for this provider
      const providerServices = servicesByProvider[providerId] || [];
      
      // Format services
      const formattedServices = providerServices.map(service => ({
        id: service._id.toString(),
        name: service.name,
        description: service.description,
        basePrice: service.basePrice,
        unit: service.unit,
        category: service.category || (service.categoryId ? 'Uncategorized' : ''),
        categoryId: service.categoryId ? service.categoryId.toString() : null
      }));

      // Get profile photo URL if exists
      let photoUrl = null;
      if (providerObj.photoPath) {
        photoUrl = `/api/images/${providerObj.photoPath.replace(/^src\/images\//, '')}`;
      }

      return {
        id: providerId,
        name: providerObj.name,
        email: providerObj.email,
        phone: providerObj.phone || '',
        experience: providerObj.experience || '',
        city: providerObj.city || '',
        province: providerObj.province || '',
        area: providerObj.area || '',
        photo: photoUrl,
        services: formattedServices,
        status: 'available', // All fetched providers are available
        location: providerObj.location || null // Include location coordinates
      };
    });

    return NextResponse.json({
      success: true,
      providers: providersWithServices,
      categories: categories.map(cat => ({
        id: cat._id.toString(),
        name: cat.name
      }))
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

