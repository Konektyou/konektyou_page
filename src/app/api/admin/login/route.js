import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import ActivityLog from '@/models/ActivityLog';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find admin by username
    const admin = await Admin.findOne({ 
      username: username.toLowerCase().trim(),
      isActive: true 
    });

    if (!admin) {
      // Log failed login attempt
      try {
        await ActivityLog.create({
          adminId: null,
          username: username,
          action: 'failed_login',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          success: false,
          message: 'Admin not found'
        });
      } catch (logError) {
        console.error('Error logging failed login:', logError);
      }

      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      // Log failed login attempt
      try {
        await ActivityLog.create({
          adminId: admin._id,
          username: admin.username,
          action: 'failed_login',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          success: false,
          message: 'Invalid password'
        });
      } catch (logError) {
        console.error('Error logging failed login:', logError);
      }

      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Log successful login
    try {
      await ActivityLog.create({
        adminId: admin._id,
        username: admin.username,
        action: 'login',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: true,
        message: 'Login successful'
      });
    } catch (logError) {
      console.error('Error logging login:', logError);
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token: token,
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
        role: admin.role
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

