import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Provider from '@/models/Provider';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const jwt = require('jsonwebtoken');

function getDecodedFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'your-secret-key');
  } catch {
    return null;
  }
}

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

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

    // Verify the provider ID matches the token
    if (providerId !== decoded.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const provider = await Provider.findById(providerId).select('-password');

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: provider._id.toString(),
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        city: provider.city,
        province: provider.province,
        serviceType: provider.serviceType,
        experience: provider.experience,
        businessName: provider.businessName,
        profileStatus: provider.profileStatus,
        verificationStatus: provider.verificationStatus,
        rejectionReason: provider.rejectionReason,
        photoPath: provider.photoPath,
        location: provider.location || null,
        createdAt: provider.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update profile (name, photo, password)
export async function PATCH(request) {
  try {
    await connectToDatabase();

    const decoded = getDecodedFromRequest(request);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const providerId = decoded.id;
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 });
    }

    const contentType = request.headers.get('content-type') || '';
    let name = null;
    let profilePhoto = null;
    let currentPassword = null;
    let newPassword = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const n = formData.get('name');
      if (n != null && typeof n === 'string') name = n.trim() || null;
      const file = formData.get('profilePhoto');
      if (file && file instanceof File && file.size > 0) profilePhoto = file;
      const cp = formData.get('currentPassword');
      if (cp != null && typeof cp === 'string') currentPassword = cp || null;
      const np = formData.get('newPassword');
      if (np != null && typeof np === 'string') newPassword = np || null;
    } else {
      const body = await request.json();
      if (body.name != null) name = typeof body.name === 'string' ? body.name.trim() || null : null;
      if (body.currentPassword != null) currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : null;
      if (body.newPassword != null) newPassword = typeof body.newPassword === 'string' ? body.newPassword : null;
    }

    // Password change: require both and validate current
    if (newPassword != null && newPassword !== '') {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: 'Current password is required to set a new password' },
          { status: 400 }
        );
      }
      const valid = await provider.comparePassword(currentPassword);
      if (!valid) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: 'New password must be at least 6 characters' },
          { status: 400 }
        );
      }
      provider.password = newPassword;
    }

    if (name != null && name !== '') {
      provider.name = name;
    }

    if (profilePhoto && profilePhoto instanceof File) {
      const maxSize = 3 * 1024 * 1024; // 3MB
      if (profilePhoto.size > maxSize) {
        return NextResponse.json(
          { success: false, message: 'Profile photo must be less than 3MB' },
          { status: 400 }
        );
      }
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(profilePhoto.type)) {
        return NextResponse.json(
          { success: false, message: 'Profile photo must be JPG, PNG or WebP' },
          { status: 400 }
        );
      }
      const imagesDir = join(process.cwd(), 'src', 'images');
      if (!existsSync(imagesDir)) {
        await mkdir(imagesDir, { recursive: true });
      }
      const timestamp = Date.now();
      const ext = profilePhoto.name && /\.(jpe?g|png|webp)$/i.test(profilePhoto.name)
        ? profilePhoto.name.slice(profilePhoto.name.lastIndexOf('.'))
        : '.jpg';
      const fileName = `provider_${providerId}_${timestamp}${ext}`;
      const filePath = join(imagesDir, fileName);
      const bytes = await profilePhoto.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));
      provider.photoPath = `images/${fileName}`;
    }

    await provider.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: provider._id.toString(),
        name: provider.name,
        email: provider.email,
        photoPath: provider.photoPath
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

