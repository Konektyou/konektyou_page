import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Provider from '@/models/Provider';
import { getEmailTransporter } from '@/lib/emailConfig';

const jwt = require('jsonwebtoken');

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

    // Check if provider already exists
    const existingProvider = await Provider.findOne({ email: email.toLowerCase().trim() });
    
    if (existingProvider) {
      return NextResponse.json(
        { success: false, message: 'Provider with this email already exists' },
        { status: 400 }
      );
    }

    // Generate OTP for email verification
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new provider (only basic info during signup)
    // Account is inactive until email is verified
    const provider = await Provider.create({
      email: email.toLowerCase().trim(),
      password,
      name,
      phone: '', // Will be filled in profile completion
      serviceType: '', // Will be filled in profile completion
      experience: '',
      area: '',
      businessName: '',
      profileStatus: 'INCOMPLETE', // Profile not yet completed
      verificationStatus: 'NOT_SUBMITTED', // Not yet submitted for review
      isVerified: false,
      isActive: false, // Inactive until email verified
      isBanned: false,
      isEmailVerified: false,
      emailVerificationOTP: String(otp), // Ensure it's a string
      emailVerificationOTPExpires: otpExpires
    });

    // Reload from DB to verify OTP was saved correctly
    const savedProvider = await Provider.findById(provider._id);
    console.log('Provider created with OTP:', {
      email: savedProvider.email,
      hasOTP: !!savedProvider.emailVerificationOTP,
      otp: savedProvider.emailVerificationOTP,
      otpType: typeof savedProvider.emailVerificationOTP,
      expires: savedProvider.emailVerificationOTPExpires,
      isEmailVerified: savedProvider.isEmailVerified
    });
    
    // If OTP wasn't saved, save it again
    if (!savedProvider.emailVerificationOTP) {
      console.log('OTP missing after create, saving again...');
      savedProvider.emailVerificationOTP = String(otp);
      savedProvider.emailVerificationOTPExpires = otpExpires;
      await savedProvider.save();
    }

    // Display OTP prominently in console
    console.log('\n========================================');
    console.log('📧 EMAIL VERIFICATION OTP CODE');
    console.log('========================================');
    console.log(`Email: ${provider.email}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires: ${otpExpires.toLocaleString()}`);
    console.log('========================================\n');

    // Send OTP email
    try {
      const transporter = getEmailTransporter();
      const fromEmail = process.env.SMTP_USER || process.env.EMAIL_USER || 'mudassarhus667788@gmail.com';

      const mailOptions = {
        from: fromEmail,
        to: provider.email,
        subject: 'Email Verification Code - Konektly',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
              Email Verification Code
            </h2>
            <div style="margin-top: 20px;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hello ${provider.name},
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
      console.log('OTP email sent to:', provider.email);
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      // Continue even if email fails - user can request resend
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email for verification code.',
      requiresVerification: true,
      provider: {
        id: provider._id.toString(),
        email: provider.email,
        name: provider.name,
        profileStatus: provider.profileStatus,
        verificationStatus: provider.verificationStatus,
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

