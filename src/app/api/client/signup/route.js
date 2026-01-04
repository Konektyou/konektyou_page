import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Client from '@/models/Client';
import nodemailer from 'nodemailer';

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();
    
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if client already exists
    const existingClient = await Client.findOne({ email: email.toLowerCase().trim() });
    
    if (existingClient) {
      return NextResponse.json(
        { success: false, message: 'Client with this email already exists' },
        { status: 400 }
      );
    }

    // Generate OTP for email verification
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new client (only basic info during signup)
    // Account is inactive until email is verified
    const client = await Client.create({
      email: email.toLowerCase().trim(),
      password,
      name,
      phone: '', // Will be filled in dashboard
      address: '',
      city: '',
      province: '',
      postalCode: '',
      isActive: false, // Inactive until email verified
      isBanned: false,
      isEmailVerified: false,
      emailVerificationOTP: String(otp), // Ensure it's a string
      emailVerificationOTPExpires: otpExpires
    });

    // Reload from DB to verify OTP was saved correctly
    const savedClient = await Client.findById(client._id);
    console.log('Client created with OTP:', {
      email: savedClient.email,
      hasOTP: !!savedClient.emailVerificationOTP,
      otp: savedClient.emailVerificationOTP,
      otpType: typeof savedClient.emailVerificationOTP,
      expires: savedClient.emailVerificationOTPExpires,
      isEmailVerified: savedClient.isEmailVerified
    });
    
    // If OTP wasn't saved, save it again
    if (!savedClient.emailVerificationOTP) {
      console.log('OTP missing after create, saving again...');
      savedClient.emailVerificationOTP = String(otp);
      savedClient.emailVerificationOTPExpires = otpExpires;
      await savedClient.save();
    }

    // Display OTP prominently in console
    console.log('\n========================================');
    console.log('📧 EMAIL VERIFICATION OTP CODE');
    console.log('========================================');
    console.log(`Email: ${client.email}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires: ${otpExpires.toLocaleString()}`);
    console.log('========================================\n');

    // Send OTP email
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtpout.secureserver.net',
        port: 587,
        secure: false,
        auth: {
          user: 'hello@konektly.ca',
          pass: 'thisisit@2025',
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        from: 'hello@konektly.ca',
        to: client.email,
        subject: 'Email Verification Code - Konektly',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
              Email Verification Code
            </h2>
            <div style="margin-top: 20px;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hello ${client.name},
              </p>
              <p style="color: #666; line-height: 1.6;">
                Thank you for signing up! Please use the following verification code to verify your email address:
              </p>
              
              <div style="margin: 30px 0; text-align: center;">
                <div style="display: inline-block; padding: 20px 40px; background-color: #f9f9f9; border: 2px solid #000; border-radius: 8px;">
                  <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000; margin: 0;">
                    ${otp}
                  </p>
                </div>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
              </p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
                <p style="color: #666; font-size: 12px; margin: 0;">
                  This is an automated notification from Konektly.<br>
                  Please do not reply to this email.
                </p>
              </div>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('OTP email sent to:', client.email);
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      // Continue even if email fails - user can request resend
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email for verification code.',
      requiresVerification: true,
      client: {
        id: client._id.toString(),
        email: client.email,
        name: client.name,
        isEmailVerified: false
      },
      // Only return OTP in development
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to create account', error: error.message },
      { status: 500 }
    );
  }
}

