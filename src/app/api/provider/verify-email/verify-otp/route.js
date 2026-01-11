import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Provider from '@/models/Provider';
import { getEmailTransporter } from '@/lib/emailConfig';
const jwt = require('jsonwebtoken');

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const provider = await Provider.findOne({ email: email.toLowerCase().trim() });

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Account not found' },
        { status: 404 }
      );
    }

    // Debug logging
    console.log('Verify OTP - Provider found:', {
      email: provider.email,
      hasOTP: !!provider.emailVerificationOTP,
      otp: provider.emailVerificationOTP,
      otpType: typeof provider.emailVerificationOTP,
      hasExpires: !!provider.emailVerificationOTPExpires,
      expires: provider.emailVerificationOTPExpires,
      isEmailVerified: provider.isEmailVerified,
      receivedOTP: otp,
      receivedOTPType: typeof otp
    });

    // Check if already verified
    if (provider.isEmailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email already verified',
        verified: true
      });
    }

    // Check if OTP exists and is valid
    if (!provider.emailVerificationOTP || !provider.emailVerificationOTPExpires) {
      console.log('OTP missing - provider data:', {
        emailVerificationOTP: provider.emailVerificationOTP,
        emailVerificationOTPExpires: provider.emailVerificationOTPExpires
      });
      
      // Auto-generate and send new OTP if missing
      const generateOTP = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
      };
      
      const newOtp = generateOTP();
      const newOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
      
      provider.emailVerificationOTP = String(newOtp);
      provider.emailVerificationOTPExpires = newOtpExpires;
      await provider.save();
      
      // Send new OTP email
      try {
        const transporter = getEmailTransporter();
        const fromEmail = process.env.SMTP_USER || process.env.EMAIL_USER || 'mudassarhus667788@gmail.com';

        await transporter.sendMail({
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
                  Please use the following verification code to verify your email address:
                </p>
                <div style="margin: 30px 0; text-align: center;">
                  <div style="display: inline-block; padding: 20px 40px; background-color: #f9f9f9; border: 2px solid #000; border-radius: 8px;">
                    <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000; margin: 0;">
                      ${newOtp}
                    </p>
                  </div>
                </div>
                <p style="color: #666; line-height: 1.6;">
                  This code will expire in 10 minutes.
                </p>
              </div>
            </div>
          `,
        });
        console.log('Auto-sent new OTP to:', provider.email);
      } catch (emailError) {
        console.error('Error auto-sending OTP:', emailError);
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'No verification code found. A new code has been sent to your email. Please check your inbox and try again.',
          newCodeSent: true
        },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > provider.emailVerificationOTPExpires) {
      return NextResponse.json(
        { success: false, message: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP (compare as strings)
    const storedOTP = String(provider.emailVerificationOTP).trim();
    const receivedOTP = String(otp).trim();
    
    console.log('OTP Comparison:', {
      storedOTP,
      receivedOTP,
      match: storedOTP === receivedOTP
    });
    
    if (storedOTP !== receivedOTP) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Mark email as verified
    provider.isEmailVerified = true;
    provider.emailVerificationOTP = undefined;
    provider.emailVerificationOTPExpires = undefined;
    provider.isActive = true; // Activate account after email verification
    await provider.save();

    // Generate JWT token for auto-login
    const token = jwt.sign(
      { id: provider._id.toString(), email: provider.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      token: token,
      provider: {
        id: provider._id.toString(),
        email: provider.email,
        name: provider.name,
        profileStatus: provider.profileStatus,
        verificationStatus: provider.verificationStatus,
        isEmailVerified: provider.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify code', error: error.message },
      { status: 500 }
    );
  }
}

