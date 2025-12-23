import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Check if any admin exists
    const adminCount = await Admin.countDocuments();
    
    if (adminCount === 0) {
      // Create default admin
      const defaultAdmin = await Admin.create({
        username: 'admin',
        password: 'admin123', // Will be hashed by pre-save hook
        email: 'admin@konektly.ca',
        role: 'super_admin',
        isActive: true
      });
      
      return NextResponse.json({
        adminExists: false,
        adminCreated: true,
        message: 'Default admin created. Username: admin, Password: admin123'
      });
    }
    
    return NextResponse.json({
      adminExists: true,
      adminCreated: false,
      message: 'Admin account exists'
    });
  } catch (error) {
    console.error('Error checking/creating admin:', error);
    return NextResponse.json(
      { 
        adminExists: false,
        adminCreated: false,
        error: 'Failed to check admin status',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

