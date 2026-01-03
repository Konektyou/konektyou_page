import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import AdminSettings from '@/models/AdminSettings';

// GET - Fetch admin settings
export async function GET(request) {
  try {
    await connectToDatabase();

    // Check admin authentication (basic check - token is validated by presence)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const settings = await AdminSettings.getSettings();

    return NextResponse.json({
      success: true,
      settings: {
        commissionRate: settings.commissionRate
      }
    });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update admin settings
export async function PUT(request) {
  try {
    await connectToDatabase();

    // Check admin authentication (basic check - token is validated by presence)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { commissionRate } = await request.json();

    if (commissionRate === undefined || commissionRate === null) {
      return NextResponse.json(
        { success: false, message: 'Commission rate is required' },
        { status: 400 }
      );
    }

    const rate = parseFloat(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      return NextResponse.json(
        { success: false, message: 'Commission rate must be between 0 and 100' },
        { status: 400 }
      );
    }

    const settings = await AdminSettings.getSettings();
    settings.commissionRate = rate;
    // Note: updatedBy could be extracted from token if needed, but for now we'll leave it null
    // since admin uses simple token, not JWT
    await settings.save();

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        commissionRate: settings.commissionRate
      }
    });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

