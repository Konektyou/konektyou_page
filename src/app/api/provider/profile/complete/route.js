import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Provider from '@/models/Provider';

const jwt = require('jsonwebtoken');
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request) {
  try {
    await connectToDatabase();

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const providerId = decoded.id;
    const provider = await Provider.findById(providerId);

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Check if profile is already approved (can't edit if approved)
    if (provider.profileStatus === 'APPROVED') {
      return NextResponse.json(
        { success: false, message: 'Profile is already approved and cannot be edited' },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();

    // Update basic fields
    const name = formData.get('name');
    const phone = formData.get('phone');
    const city = formData.get('city');
    const province = formData.get('province');
    const serviceType = formData.get('serviceType');
    const experience = formData.get('experience');
    const businessName = formData.get('businessName') || '';
    
    // Location coordinates
    const latitude = formData.get('latitude');
    const longitude = formData.get('longitude');

    // Validate required fields (province is now optional)
    if (!name || !phone || !city || !serviceType || !experience) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    // Handle profile photo upload
    const profilePhoto = formData.get('profilePhoto');
    let photoPath = provider.photoPath;

    if (profilePhoto && profilePhoto instanceof File) {
      const bytes = await profilePhoto.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create images directory if it doesn't exist
      const imagesDir = join(process.cwd(), 'src', 'images');
      if (!existsSync(imagesDir)) {
        await mkdir(imagesDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const originalName = profilePhoto.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${providerId}_${timestamp}_${originalName}`;
      const filePath = join(imagesDir, fileName);

      // Save file
      await writeFile(filePath, buffer);
      photoPath = `src/images/${fileName}`;
    }

    // Handle document uploads
    const documents = formData.getAll('documents');
    const documentTypes = formData.getAll('documentTypes');
    const uploadedDocuments = [];

    if (documents.length > 0) {
      const imagesDir = join(process.cwd(), 'src', 'images');
      if (!existsSync(imagesDir)) {
        await mkdir(imagesDir, { recursive: true });
      }

      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        if (doc instanceof File) {
          const bytes = await doc.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Generate unique filename
          const timestamp = Date.now();
          const originalName = doc.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const fileName = `${providerId}_${timestamp}_${i}_${originalName}`;
          const filePath = join(imagesDir, fileName);

          // Save file
          await writeFile(filePath, buffer);

          uploadedDocuments.push({
            documentType: documentTypes[i] || 'Professional Document',
            fileName: fileName,
            originalName: doc.name,
            filePath: `src/images/${fileName}`,
            fileSize: doc.size,
            fileType: doc.type,
            uploadedAt: new Date(),
            status: 'pending'
          });
        }
      }
    }

    // Update provider
    const updateData = {
      name,
      phone,
      city,
      province: province || '', // Province is optional
      serviceType,
      experience,
      businessName,
      profileStatus: 'PENDING_REVIEW',
      verificationStatus: 'PENDING'
    };
    
    // Add location coordinates if provided
    if (latitude && longitude) {
      updateData.location = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      };
    }

    if (photoPath) {
      updateData.photoPath = photoPath;
    }

    // If there are new documents, add them to the existing documents array
    if (uploadedDocuments.length > 0) {
      // Use MongoDB native update to push documents
      await Provider.updateOne(
        { _id: providerId },
        {
          $set: updateData,
          $push: { documents: { $each: uploadedDocuments } }
        }
      );
    } else {
      // Just update the provider data
      await Provider.updateOne({ _id: providerId }, { $set: updateData });
    }

    // Fetch updated provider
    const updatedProvider = await Provider.findById(providerId).select('-password');

    return NextResponse.json({
      success: true,
      message: 'Profile submitted successfully',
      provider: {
        id: updatedProvider._id.toString(),
        name: updatedProvider.name,
        email: updatedProvider.email,
        profileStatus: updatedProvider.profileStatus,
        verificationStatus: updatedProvider.verificationStatus
      }
    });
  } catch (error) {
    console.error('Error completing profile:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

