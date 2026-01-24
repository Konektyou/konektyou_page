import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Provider from '@/models/Provider';

export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    // Check admin authentication (token from Authorization header)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Await params for Next.js 15
    const { id } = await params;

    const provider = await Provider.findById(id).select('-password');

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Format documents
    const documents = (provider.documents || []).map(doc => ({
      documentType: doc.documentType,
      fileName: doc.fileName,
      originalName: doc.originalName,
      filePath: doc.filePath,
      fileSize: doc.fileSize,
      fileType: doc.fileType,
      uploadedAt: doc.uploadedAt,
      status: doc.status,
      rejectionReason: doc.rejectionReason
    }));

    return NextResponse.json({
      success: true,
      provider: {
        id: provider._id.toString(),
        name: provider.name,
        email: provider.email,
        phone: provider.phone || '',
        city: provider.city || '',
        province: provider.province || '',
        serviceType: provider.serviceType || '',
        experience: provider.experience || '',
        businessName: provider.businessName || '',
        profileStatus: provider.profileStatus,
        verificationStatus: provider.verificationStatus,
        rejectionReason: provider.rejectionReason,
        photoPath: provider.photoPath,
        documents: documents,
        createdAt: provider.createdAt,
        updatedAt: provider.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching provider:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

