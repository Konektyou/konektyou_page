import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Business from '@/models/Business';
import { getEmailTransporter } from '@/lib/emailConfig';

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
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

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to business record
    business.emailVerificationOTP = String(otp); // Ensure it's a string
    business.emailVerificationOTPExpires = otpExpires;
    await business.save();
    
    // Verify OTP was saved
    const savedBusiness = await Business.findById(business._id);
    console.log('Send OTP - OTP saved:', {
      email: savedBusiness.email,
      hasOTP: !!savedBusiness.emailVerificationOTP,
      otp: savedBusiness.emailVerificationOTP,
      expires: savedBusiness.emailVerificationOTPExpires
    });

    // Send OTP email
    try {
      const transporter = getEmailTransporter();
      const fromEmail = process.env.SMTP_USER || 'hello@konektly.ca';

      const mailOptions = {
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
      console.log('OTP email sent to:', business.email);
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send verification code', error: error.message },
      { status: 500 }
    );
  }
}

