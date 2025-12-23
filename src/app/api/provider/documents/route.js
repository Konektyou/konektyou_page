import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Provider from '@/models/Provider';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

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

    // Use MongoDB native query to get documents (handles both old and new schema)
    const mongooseConnection = await connectToDatabase();
    const db = mongooseConnection.connection.db;
    const collection = db.collection('providers');
    
    const ObjectId = mongoose.Types.ObjectId;
    const providerObjectId = new ObjectId(providerId);
    
    const provider = await collection.findOne(
      { _id: providerObjectId },
      { projection: { documents: 1 } }
    );
    
    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Filter out any string entries (old schema) and ensure proper format
    let documents = [];
    if (provider.documents && Array.isArray(provider.documents)) {
      documents = provider.documents
        .filter(doc => typeof doc === 'object' && doc !== null && !Array.isArray(doc))
        .map(doc => {
          // Handle both ObjectId and string _id
          const docId = doc._id 
            ? (typeof doc._id === 'object' ? doc._id.toString() : doc._id)
            : doc.fileName;
          
          return {
            _id: docId,
            documentType: doc.documentType || doc.type || 'Document',
            fileName: doc.fileName || '',
            originalName: doc.originalName || '',
            filePath: doc.filePath || '',
            fileSize: doc.fileSize || 0,
            fileType: doc.fileType || '',
            uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString() : new Date().toISOString(),
            status: doc.status || 'pending',
            rejectionReason: doc.rejectionReason || null
          };
        });
    }

    console.log('Fetched documents:', documents.length, 'documents'); // Debug log

    return NextResponse.json({
      success: true,
      documents: documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch documents', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { providerId, documentId } = await request.json();

    if (!providerId || !documentId) {
      return NextResponse.json(
        { success: false, message: 'Provider ID and document ID are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const provider = await Provider.findById(providerId);
    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Find the document to delete (to get file path for deletion)
    const documentToDelete = provider.documents?.find(
      doc => (doc._id?.toString() === documentId || doc.fileName === documentId)
    );

    // Delete file from filesystem if it exists
    if (documentToDelete?.filePath) {
      try {
        const filePath = path.join(process.cwd(), 'src', documentToDelete.filePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Continue even if file deletion fails
      }
    }

    // Use MongoDB native update to remove document
    const mongooseConnection = await connectToDatabase();
    const db = mongooseConnection.connection.db;
    const collection = db.collection('providers');
    
    const ObjectId = mongoose.Types.ObjectId;
    const providerObjectId = new ObjectId(providerId);
    
    // Try to match by _id first, then by fileName
    let pullQuery = {};
    try {
      // Try as ObjectId
      const docObjectId = new ObjectId(documentId);
      pullQuery = {
        $or: [
          { _id: docObjectId },
          { fileName: documentId }
        ]
      };
    } catch (e) {
      // If not a valid ObjectId, just match by fileName
      pullQuery = { fileName: documentId };
    }
    
    await collection.updateOne(
      { _id: providerObjectId },
      {
        $pull: {
          documents: pullQuery
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete document', error: error.message },
      { status: 500 }
    );
  }
}

