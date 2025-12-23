import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Business from '@/models/Business';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find business by email
    const business = await Business.findOne({ email: email.toLowerCase().trim() });

    if (!business) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if business is banned
    if (business.isBanned) {
      return NextResponse.json(
        { success: false, message: 'Your account has been banned. Reason: ' + (business.banReason || 'Contact support for more information') },
        { status: 403 }
      );
    }

    // Check if email is verified
    if (!business.isEmailVerified) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please verify your email address before logging in. Check your email for the verification code.',
          requiresVerification: true,
          email: business.email
        },
        { status: 403 }
      );
    }

    // Check if business is active
    if (!business.isActive) {
      return NextResponse.json(
        { success: false, message: 'Your account has been deactivated. Please contact support' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await business.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    business.lastLogin = new Date();
    await business.save();

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');

    // Return business data (without password)
    const businessData = {
      id: business._id.toString(),
      email: business.email,
      name: business.name,
      businessName: business.businessName,
      phone: business.phone,
      address: business.address,
      city: business.city,
      province: business.province,
      postalCode: business.postalCode,
      isVerified: business.isVerified,
      isActive: business.isActive,
      isBanned: business.isBanned,
      createdAt: business.createdAt
    };

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token: token,
      business: businessData
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed', error: error.message },
      { status: 500 }
    );
  }
}

