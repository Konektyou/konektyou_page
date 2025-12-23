import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Provider from '@/models/Provider';

const jwt = require('jsonwebtoken');

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

    // Find provider by email
    const provider = await Provider.findOne({ 
      email: email.toLowerCase().trim()
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if provider is banned
    if (provider.isBanned) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Your account has been banned',
          banReason: provider.banReason || 'Account banned by administrator'
        },
        { status: 403 }
      );
    }

    // Check if email is verified
    if (!provider.isEmailVerified) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please verify your email address before logging in. Check your email for the verification code.',
          requiresVerification: true,
          email: provider.email
        },
        { status: 403 }
      );
    }

    // Check if provider is deactivated
    if (!provider.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Your account has been deactivated. Please contact support.'
        },
        { status: 403 }
      );
    }

    // Compare password
    const isPasswordValid = await provider.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    provider.lastLogin = new Date();
    await provider.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: provider._id.toString(), email: provider.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token: token,
      provider: {
        id: provider._id.toString(),
        email: provider.email,
        name: provider.name,
        profileStatus: provider.profileStatus || 'INCOMPLETE',
        verificationStatus: provider.verificationStatus || 'NOT_SUBMITTED',
        isVerified: provider.isVerified,
        canWork: provider.canWork()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed', error: error.message },
      { status: 500 }
    );
  }
}

