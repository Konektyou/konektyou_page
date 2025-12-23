import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Service from '@/models/Service';
import ServiceCategory from '@/models/ServiceCategory';
const jwt = require('jsonwebtoken');

export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { providerId } = await params;

    // Fetch all services for this provider
    const services = await Service.find({ providerId }).sort({ createdAt: -1 });

    // Fetch category names for services
    const servicesWithCategories = await Promise.all(
      services.map(async (service) => {
        const serviceObj = service.toObject ? service.toObject() : service;
        if (serviceObj.categoryId) {
          try {
            const category = await ServiceCategory.findById(serviceObj.categoryId);
            if (category) {
              serviceObj.categoryName = category.name;
            }
          } catch (err) {
            console.error('Error fetching category:', err);
          }
        }
        return serviceObj;
      })
    );

    return NextResponse.json({
      success: true,
      services: servicesWithCategories.map(s => ({
        id: s._id.toString(),
        name: s.name,
        description: s.description,
        basePrice: s.basePrice,
        unit: s.unit,
        category: s.categoryName || s.category,
        active: s.active,
        createdAt: s.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching provider services:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

