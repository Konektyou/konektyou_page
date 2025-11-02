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
      // Create transporter with GoDaddy email SMTP settings
      const transporter = nodemailer.createTransport({
        host: 'smtpout.secureserver.net', // GoDaddy Workspace Email uses Office 365
        port: 587,
        secure: false, // false for STARTTLS on port 587
        auth: {
          user: 'hello@konektly.ca',
          pass: 'Thisisit@2025',
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false,
        },
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
