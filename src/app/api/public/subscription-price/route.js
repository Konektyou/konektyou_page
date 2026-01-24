import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import AdminSettings from '@/models/AdminSettings';

// GET - Fetch subscription price (public endpoint)
export async function GET() {
  try {
    await connectToDatabase();

    const settings = await AdminSettings.getSettings();

    return NextResponse.json({
      success: true,
      price: settings.clientSubscriptionPrice || 50
    });
  } catch (error) {
    console.error('Error fetching subscription price:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message, price: 50 },
      { status: 500 }
    );
  }
}
