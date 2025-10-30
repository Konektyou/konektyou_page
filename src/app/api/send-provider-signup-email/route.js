import { NextResponse } from 'next/server';
import { appendJsonRecord } from '@/lib/storage';
import { connectToDatabase } from '@/lib/mongodb';
import ProviderSignup from '@/models/ProviderSignup';

export async function POST(request) {
  try {
    const { name, email, phone, serviceType, experience, area, businessName, documents, photo } = await request.json();

    // Save provider data to local JSON "DB" (non-fatal)
    try {
      await appendJsonRecord('providerSignups.json', {
        name,
        email,
        phone,
        serviceType,
        experience,
        area,
        businessName,
        documents,
        photoName: photo?.name || null
      });
    } catch (e) {
      console.error('Storage error (non-fatal):', e);
    }

    // Save to MongoDB (mandatory)
    await connectToDatabase();
    await ProviderSignup.create({
      name,
      email,
      phone,
      serviceType,
      experience,
      area,
      businessName,
      documents: documents || [],
      photoName: photo?.name || null,
    });

    return NextResponse.json({ success: true, message: 'Provider signup saved successfully' });
  } catch (error) {
    console.error('Error saving provider signup:', {
      message: error?.message,
      code: error?.code,
      response: error?.response,
    });
    return NextResponse.json(
      { success: false, message: 'Failed to save provider signup' },
      { status: 500 }
    );
  }
}
