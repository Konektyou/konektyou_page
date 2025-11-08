import { NextResponse } from 'next/server';
import { appendJsonRecord } from '@/lib/storage';
import { connectToDatabase } from '@/lib/mongodb';
import ClientSignup from '@/models/ClientSignup';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { name, email, phone, service, area, time } = await request.json();

    // Save to local JSON "DB" (non-fatal)
    try {
      await appendJsonRecord('clientSignups.json', { name, email, phone, service, area, time });
    } catch (e) {
      console.error('Storage error (non-fatal):', e);
    }

    // Save to MongoDB (mandatory)
    await connectToDatabase();
    await ClientSignup.create({ name, email, phone, service, area, time });

    // Send email after successful database save
    try {
      // Get email configuration from environment variables - GODADDY
      const smtpHost = process.env.SMTP_HOST || 'smtpout.secureserver.net';
      const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
      const smtpUser = process.env.SMTP_USER || 'hello@konektly.ca';
      const smtpPass = process.env.SMTP_PASS || 'thisisit@2025';
      
      // Ensure we're using GoDaddy, not Outlook or Hostinger
      const finalHost = smtpHost.includes('secureserver') || smtpHost.includes('godaddy') 
        ? smtpHost 
        : 'smtpout.secureserver.net';
      
      console.log('Email configuration:', {
        host: finalHost,
        port: smtpPort,
        user: smtpUser,
        hasPassword: !!smtpPass,
        usingGoDaddy: finalHost.includes('secureserver') || finalHost.includes('godaddy')
      });
      
      // If no password is set, skip email sending
      if (!smtpPass) {
        console.warn('SMTP_PASS not configured, skipping email send');
        // Continue to return success response below
      } else {
        // Determine if using SSL (port 465) or TLS (port 587)
        const useSSL = smtpPort === 465;

        // Create transporter with GoDaddy SMTP settings
        const transporter = nodemailer.createTransport({
          host: finalHost,
          port: smtpPort,
          secure: useSSL, // true for SSL (port 465), false for STARTTLS (port 587)
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          // GoDaddy-specific TLS configuration
          tls: {
            rejectUnauthorized: false, // Allow self-signed certificates
            ciphers: 'SSLv3',
          },
          // Connection timeout
          connectionTimeout: 10000, // 10 seconds
          greetingTimeout: 10000,
          socketTimeout: 10000,
          debug: true, // Enable debug output
          logger: true, // Enable logging
        });

        // Try to verify connection (non-blocking - continue even if it fails)
        transporter.verify().then(() => {
          console.log('SMTP connection verified successfully');
        }).catch((verifyError) => {
          console.warn('SMTP verification warning (continuing anyway):', {
            message: verifyError?.message,
            code: verifyError?.code,
          });
          // Don't throw - continue to try sending email
        });

      // Format time display
      const timeDisplay = {
        morning: 'Morning (8 AM - 12 PM)',
        afternoon: 'Afternoon (12 PM - 5 PM)',
        evening: 'Evening (5 PM - 9 PM)',
        flexible: 'Flexible',
      }[time] || time;

      // Email content
      const mailOptions = {
        from: 'hello@konektly.ca',
        to: 'konektdemo@gmail.com',
        subject: `New Client Signup: ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
              New Client Signup
            </h2>
            <div style="margin-top: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Full Name:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Email Address:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Phone Number:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Service Needed:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${service}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Service Area:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${area}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Preferred Time:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${timeDisplay}</td>
                </tr>
              </table>
            </div>
            <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #000;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                This signup has been successfully saved to the database.
              </p>
            </div>
          </div>
        `,
      };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!', {
          messageId: info.messageId,
          to: 'konektdemo@gmail.com',
        });
      }
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error('Error sending email:', {
        message: emailError?.message,
        code: emailError?.code,
        response: emailError?.response,
      });
    }

    return NextResponse.json({ success: true, message: 'Signup saved successfully' });
  } catch (error) {
    console.error('Error saving signup:', {
      message: error?.message,
      code: error?.code,
      response: error?.response,
    });
    return NextResponse.json(
      { success: false, message: 'Failed to save signup' },
      { status: 500 }
    );
  }
}
