import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Client from '@/models/Client';
import Business from '@/models/Business';
import Provider from '@/models/Provider';

export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    // Await params for Next.js 15
    const { role, id } = await params;

    let user = null;

    switch (role) {
      case 'client':
        user = await Client.findById(id).select('-password -resetPasswordToken -resetPasswordExpires').lean();
        if (user) {
          user = {
            id: user._id.toString(),
            role: 'client',
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            address: user.address || '',
            city: user.city || '',
            province: user.province || '',
            postalCode: user.postalCode || '',
            isActive: user.isActive,
            isBanned: user.isBanned,
            banReason: user.banReason || '',
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          };
        }
        break;

      case 'business':
        user = await Business.findById(id).select('-password -resetPasswordToken -resetPasswordExpires').lean();
        if (user) {
          user = {
            id: user._id.toString(),
            role: 'business',
            name: user.name,
            email: user.email,
            businessName: user.businessName || '',
            phone: user.phone || '',
            address: user.address || '',
            city: user.city || '',
            province: user.province || '',
            postalCode: user.postalCode || '',
            isVerified: user.isVerified,
            isActive: user.isActive,
            isBanned: user.isBanned,
            banReason: user.banReason || '',
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          };
        }
        break;

      case 'provider':
        user = await Provider.findById(id).select('-password -resetPasswordToken -resetPasswordExpires').lean();
        if (user) {
          // Format documents
          const documents = (user.documents || []).map(doc => ({
            id: doc._id?.toString() || '',
            documentType: doc.documentType || '',
            fileName: doc.fileName || '',
            originalName: doc.originalName || '',
            filePath: doc.filePath || '',
            fileSize: doc.fileSize || 0,
            fileType: doc.fileType || '',
            uploadedAt: doc.uploadedAt || doc.createdAt,
            status: doc.status || 'pending',
            rejectionReason: doc.rejectionReason || ''
          }));

          user = {
            id: user._id.toString(),
            role: 'provider',
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            city: user.city || '',
            province: user.province || '',
            serviceType: user.serviceType || '',
            experience: user.experience || '',
            businessName: user.businessName || '',
            area: user.area || '',
            profileStatus: user.profileStatus || 'INCOMPLETE',
            verificationStatus: user.verificationStatus || 'NOT_SUBMITTED',
            rejectionReason: user.rejectionReason || '',
            photoPath: user.photoPath || '',
            documents: documents,
            isVerified: user.isVerified || false,
            isActive: user.isActive,
            isBanned: user.isBanned,
            banReason: user.banReason || '',
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          };
        }
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid role' },
          { status: 400 }
        );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();

    // Await params for Next.js 15
    const { role, id } = await params;

    let result = null;

    switch (role) {
      case 'client':
        result = await Client.findByIdAndDelete(id);
        break;

      case 'business':
        result = await Business.findByIdAndDelete(id);
        break;

      case 'provider':
        result = await Provider.findByIdAndDelete(id);
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid role' },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
