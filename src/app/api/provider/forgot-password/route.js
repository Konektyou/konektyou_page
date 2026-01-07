import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Provider from '@/models/Provider';
import { getEmailTransporter } from '@/lib/emailConfig';
import crypto from 'crypto';

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

    const provider = await Provider.findOne({ email: email.toLowerCase().trim() });

    if (!provider) {
      // Don't reveal if email exists for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    provider.resetPasswordToken = resetToken;
    provider.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await provider.save();

    // Send password reset email
    try {
      const transporter = getEmailTransporter();
      const fromEmail = process.env.SMTP_USER || 'hello@konektly.ca';

      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/provider-forgot-password?token=${resetToken}`;

      const mailOptions = {
        from: fromEmail,
        to: provider.email,
        subject: 'Password Reset Request - Konektly',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
              Password Reset Request
            </h2>
            <div style="margin-top: 20px;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hello ${provider.name},
              </p>
              <p style="color: #666; line-height: 1.6;">
                We received a request to reset your password. Click the button below to reset your password:
              </p>
              
              <div style="margin: 30px 0; text-align: center;">
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 30px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #000; word-break: break-all;">${resetUrl}</a>
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
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
      console.log('Password reset email sent to:', provider.email);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process request', error: error.message },
      { status: 500 }
    );
  }
}

