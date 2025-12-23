import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Provider from '@/models/Provider';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const documentType = formData.get('documentType');
    const providerId = formData.get('providerId');

    if (!file || !documentType || !providerId) {
      return NextResponse.json(
        { success: false, message: 'File, document type, and provider ID are required' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Only PDF, JPG, and PNG files are allowed' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if provider exists
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileExtension = path.extname(originalName);
    const fileName = `${providerId}_${timestamp}${fileExtension}`;

    // Create images directory if it doesn't exist
    const imagesDir = path.join(process.cwd(), 'src', 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Save file to filesystem
    const filePath = path.join(imagesDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    // Relative path to store in database
    const relativePath = `images/${fileName}`;

    // Document data to store in database
    const documentData = {
      documentType: documentType,
      fileName: fileName,
      originalName: file.name,
      filePath: relativePath,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date(),
      status: 'pending'
    };

    // Use MongoDB's native update to bypass Mongoose schema validation
    // This handles both old [String] schema and new [Object] schema
    const mongooseConnection = await connectToDatabase();
    const db = mongooseConnection.connection.db;
    const collection = db.collection('providers');
    
    // Use Mongoose ObjectId
    const ObjectId = mongoose.Types.ObjectId;
    const providerObjectId = new ObjectId(providerId);
    
    // Get existing documents (handle both formats)
    const existingProvider = await collection.findOne({ _id: providerObjectId });
    let existingDocuments = [];
    
    if (existingProvider && existingProvider.documents) {
      if (Array.isArray(existingProvider.documents)) {
        // Filter out strings (old schema) and keep only objects
        existingDocuments = existingProvider.documents.filter(
          doc => typeof doc === 'object' && doc !== null && !Array.isArray(doc)
        );
      }
    }

    // Add new document
    existingDocuments.push(documentData);

    // Update using native MongoDB update (bypasses Mongoose casting)
    const updateData = {
      documents: existingDocuments
    };

    // Update onboarding step if documents uploaded
    if (!provider.onboardingSteps.documentsUploaded) {
      updateData['onboardingSteps.documentsUploaded'] = true;
      if (provider.onboardingStatus === 'part1_completed') {
        updateData.onboardingStatus = 'in_progress';
      }
    }

    await collection.updateOne(
      { _id: providerObjectId },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      document: documentData
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload document', error: error.message },
      { status: 500 }
    );
  }
}
