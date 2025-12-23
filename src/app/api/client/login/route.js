import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Client from '@/models/Client';
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

    // Find client by email
    const client = await Client.findOne({ email: email.toLowerCase().trim() });

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if client is banned
    if (client.isBanned) {
      return NextResponse.json(
        { success: false, message: 'Your account has been banned. Reason: ' + (client.banReason || 'Contact support for more information') },
        { status: 403 }
      );
    }

    // Check if email is verified
    if (!client.isEmailVerified) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please verify your email address before logging in. Check your email for the verification code.',
          requiresVerification: true,
          email: client.email
        },
        { status: 403 }
      );
    }

    // Check if client is active
    if (!client.isActive) {
      return NextResponse.json(
        { success: false, message: 'Your account has been deactivated. Please contact support' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await client.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    client.lastLogin = new Date();
    await client.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: client._id.toString(), email: client.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    // Return client data (without password)
    const clientData = {
      id: client._id.toString(),
      email: client.email,
      name: client.name,
      phone: client.phone,
      address: client.address,
      city: client.city,
      province: client.province,
      postalCode: client.postalCode,
      isActive: client.isActive,
      isBanned: client.isBanned,
      createdAt: client.createdAt
    };

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token: token,
      client: clientData
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed', error: error.message },
      { status: 500 }
    );
  }
}

