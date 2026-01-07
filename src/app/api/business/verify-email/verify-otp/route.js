import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Business from '@/models/Business';
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

    const business = await Business.findOne({ email: email.toLowerCase().trim() });

    if (!business) {
      return NextResponse.json(
        { success: false, message: 'Account not found' },
        { status: 404 }
      );
    }

    // Debug logging
    console.log('Verify OTP - Business found:', {
      email: business.email,
      hasOTP: !!business.emailVerificationOTP,
      otp: business.emailVerificationOTP,
      otpType: typeof business.emailVerificationOTP,
      hasExpires: !!business.emailVerificationOTPExpires,
      expires: business.emailVerificationOTPExpires,
      isEmailVerified: business.isEmailVerified,
      receivedOTP: otp,
      receivedOTPType: typeof otp
    });

    // Check if already verified
    if (business.isEmailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email already verified',
        verified: true
      });
    }

    // Check if OTP exists and is valid
    if (!business.emailVerificationOTP || !business.emailVerificationOTPExpires) {
      console.log('OTP missing - business data:', {
        emailVerificationOTP: business.emailVerificationOTP,
        emailVerificationOTPExpires: business.emailVerificationOTPExpires
      });
      
      // Auto-generate and send new OTP if missing
      const generateOTP = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
      };
      
      const newOtp = generateOTP();
      const newOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
      
      business.emailVerificationOTP = String(newOtp);
      business.emailVerificationOTPExpires = newOtpExpires;
      await business.save();
      
      // Send new OTP email
      try {
        const transporter = getEmailTransporter();
        const fromEmail = process.env.SMTP_USER || 'hello@konektly.ca';

        await transporter.sendMail({
          from: fromEmail,
          to: business.email,
          subject: 'Email Verification Code - Konektly',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
                Email Verification Code
              </h2>
              <div style="margin-top: 20px;">
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                  Hello ${business.name},
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
        console.log('Auto-sent new OTP to:', business.email);
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
    if (new Date() > business.emailVerificationOTPExpires) {
      return NextResponse.json(
        { success: false, message: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP (compare as strings)
    const storedOTP = String(business.emailVerificationOTP).trim();
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
    business.isEmailVerified = true;
    business.emailVerificationOTP = undefined;
    business.emailVerificationOTPExpires = undefined;
    business.isActive = true; // Activate account after email verification
    await business.save();

    // Generate JWT token for auto-login
    const token = jwt.sign(
      { id: business._id.toString(), email: business.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      token: token,
      business: {
        id: business._id.toString(),
        email: business.email,
        name: business.name,
        isEmailVerified: business.isEmailVerified
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

