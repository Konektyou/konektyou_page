import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Provider from '@/models/Provider';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json(
        { success: false, message: 'Provider ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const provider = await Provider.findById(providerId).select('onboardingStatus onboardingSteps documents createdAt');
    
    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Count uploaded documents
    const documentsCount = provider.documents && Array.isArray(provider.documents) 
      ? provider.documents.filter(doc => typeof doc === 'object' && doc !== null).length 
      : 0;

    return NextResponse.json({
      success: true,
      onboarding: {
        onboardingStatus: provider.onboardingStatus,
        onboardingSteps: provider.onboardingSteps,
        documentsCount: documentsCount,
        createdAt: provider.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch onboarding status', error: error.message },
      { status: 500 }
    );
  }
}

