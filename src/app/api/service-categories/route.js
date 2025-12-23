import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ServiceCategory from '@/models/ServiceCategory';

// Public API to fetch active service categories (for providers)
export async function GET(request) {
  try {
    await connectToDatabase();

    const categories = await ServiceCategory.find({ isActive: true }).sort({ name: 1 });
    
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

