import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import AdminSettings from '@/models/AdminSettings';

// GET - Fetch current tax rate (public endpoint)
export async function GET() {
  try {
    await connectToDatabase();
    const settings = await AdminSettings.getSettings();

    return NextResponse.json({
      success: true,
      taxRate: settings.taxRate || 13
    });
  } catch (error) {
    console.error('Error fetching tax rate:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

