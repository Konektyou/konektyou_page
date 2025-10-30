import { NextResponse } from 'next/server';
import { appendJsonRecord } from '@/lib/storage';
import { connectToDatabase } from '@/lib/mongodb';
import ClientSignup from '@/models/ClientSignup';

export async function POST(request) {
  try {
    const { name, email, phone, service, area, time } = await request.json();

    // Save to local JSON "DB" (non-fatal)
    try {
      await appendJsonRecord('clientSignups.json', { name, email, phone, service, area, time });
    } catch (e) {
      console.error('Storage error (non-fatal):', e);
    }

    // Save to MongoDB (mandatory)
    await connectToDatabase();
    await ClientSignup.create({ name, email, phone, service, area, time });

    return NextResponse.json({ success: true, message: 'Signup saved successfully' });
  } catch (error) {
    console.error('Error saving signup:', {
      message: error?.message,
      code: error?.code,
      response: error?.response,
    });
    return NextResponse.json(
      { success: false, message: 'Failed to save signup' },
      { status: 500 }
    );
  }
}
