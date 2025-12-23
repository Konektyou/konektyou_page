import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ServiceCategory from '@/models/ServiceCategory';

// GET - Fetch all service categories
export async function GET(request) {
  try {
    await connectToDatabase();

    // Check authorization (basic check - you can enhance this with JWT)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const categories = await ServiceCategory.find().sort({ name: 1 });
    
    return NextResponse.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('Error fetching service categories:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new service category
export async function POST(request) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, isActive } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await ServiceCategory.findOne({ 
      name: name.trim() 
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const category = await ServiceCategory.create({
      name: name.trim(),
      description: description?.trim() || '',
      isActive: isActive !== undefined ? isActive : true
    });

    return NextResponse.json({
      success: true,
      message: 'Service category created successfully',
      category: category
    });
  } catch (error) {
    console.error('Error creating service category:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a service category
export async function PUT(request) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { categoryId, name, description, isActive } = await request.json();

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: 'Category ID is required' },
        { status: 400 }
      );
    }

    const category = await ServiceCategory.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if name is being changed and if it conflicts with existing category
    if (name && name.trim() !== category.name) {
      const existingCategory = await ServiceCategory.findOne({ 
        name: name.trim(),
        _id: { $ne: categoryId }
      });

      if (existingCategory) {
        return NextResponse.json(
          { success: false, message: 'Category with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Update fields
    if (name !== undefined) category.name = name.trim();
    if (description !== undefined) category.description = description?.trim() || '';
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    return NextResponse.json({
      success: true,
      message: 'Service category updated successfully',
      category: category
    });
  } catch (error) {
    console.error('Error updating service category:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a service category
export async function DELETE(request) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: 'Category ID is required' },
        { status: 400 }
      );
    }

    const category = await ServiceCategory.findByIdAndDelete(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service category:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

