import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Service from '@/models/Service';
import ServiceCategory from '@/models/ServiceCategory';
import mongoose from 'mongoose';
const jwt = require('jsonwebtoken');

// GET - Fetch all services for the provider
export async function GET(request) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const providerId = decoded.id;

    // Fetch all services for this provider
    const services = await Service.find({ providerId }).sort({ createdAt: -1 });

    // Fetch category names for services that have categoryId
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
      services: servicesWithCategories
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Add a new service
export async function POST(request) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const providerId = decoded.id;

    const { name, description, basePrice, unit, category, active } = await request.json();

    if (!name || basePrice === undefined || basePrice === null) {
      return NextResponse.json(
        { success: false, message: 'Service name and base price are required' },
        { status: 400 }
      );
    }

    // Check if provider already has a service in this category
    if (category) {
      const existingService = await Service.findOne({
        providerId: new mongoose.Types.ObjectId(providerId),
        categoryId: new mongoose.Types.ObjectId(category)
      });

      if (existingService) {
        const categoryDoc = await ServiceCategory.findById(category);
        const categoryName = categoryDoc ? categoryDoc.name : 'this category';
        return NextResponse.json(
          { success: false, message: `You already have a service in ${categoryName}. Each provider can only create one service per category.` },
          { status: 400 }
        );
      }
    }

    // Get category name if categoryId is provided
    let categoryName = '';
    if (category) {
      try {
        const categoryDoc = await ServiceCategory.findById(category);
        if (categoryDoc) {
          categoryName = categoryDoc.name;
        }
      } catch (err) {
        console.error('Error fetching category:', err);
      }
    }

    // Create new service
    const newService = await Service.create({
      providerId: new mongoose.Types.ObjectId(providerId),
      name: name.trim(),
      description: description?.trim() || '',
      basePrice: parseFloat(basePrice),
      unit: unit || 'per hour',
      categoryId: category ? new mongoose.Types.ObjectId(category) : null,
      category: categoryName,
      active: active !== undefined ? active : true
    });

    return NextResponse.json({
      success: true,
      message: 'Service added successfully',
      service: {
        _id: newService._id,
        name: newService.name,
        description: newService.description,
        basePrice: newService.basePrice,
        unit: newService.unit,
        categoryId: newService.categoryId,
        category: newService.category,
        active: newService.active
      }
    });
  } catch (error) {
    console.error('Error adding service:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a service
export async function PUT(request) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const providerId = decoded.id;

    const { serviceId, name, description, basePrice, unit, category, active } = await request.json();

    if (!serviceId) {
      return NextResponse.json(
        { success: false, message: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Find the service and verify it belongs to this provider
    const service = await Service.findOne({ _id: serviceId, providerId });
    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    // Check if changing category and if provider already has a service in the new category
    if (category !== undefined && category !== service.categoryId?.toString() && category) {
      const existingService = await Service.findOne({
        providerId: new mongoose.Types.ObjectId(providerId),
        categoryId: new mongoose.Types.ObjectId(category),
        _id: { $ne: service._id } // Exclude current service
      });

      if (existingService) {
        const categoryDoc = await ServiceCategory.findById(category);
        const categoryName = categoryDoc ? categoryDoc.name : 'this category';
        return NextResponse.json(
          { success: false, message: `You already have a service in ${categoryName}. Each provider can only create one service per category.` },
          { status: 400 }
        );
      }
    }

    // Get category name if categoryId is being updated
    let categoryName = service.category;
    if (category !== undefined && category !== service.categoryId?.toString()) {
      if (category) {
        try {
          const categoryDoc = await ServiceCategory.findById(category);
          if (categoryDoc) {
            categoryName = categoryDoc.name;
          }
        } catch (err) {
          console.error('Error fetching category:', err);
        }
      } else {
        categoryName = '';
      }
    }

    // Update service fields
    if (name !== undefined) service.name = name.trim();
    if (description !== undefined) service.description = description?.trim() || '';
    if (basePrice !== undefined) service.basePrice = parseFloat(basePrice);
    if (unit !== undefined) service.unit = unit || 'per hour';
    if (category !== undefined) {
      service.categoryId = category ? new mongoose.Types.ObjectId(category) : null;
      service.category = categoryName;
    }
    if (active !== undefined) service.active = active;

    await service.save();

    return NextResponse.json({
      success: true,
      message: 'Service updated successfully',
      service: {
        _id: service._id,
        name: service.name,
        description: service.description,
        basePrice: service.basePrice,
        unit: service.unit,
        categoryId: service.categoryId,
        category: service.category,
        active: service.active
      }
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a service
export async function DELETE(request) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const providerId = decoded.id;

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json(
        { success: false, message: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Find and delete the service, ensuring it belongs to this provider
    const service = await Service.findOneAndDelete({ _id: serviceId, providerId });
    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
