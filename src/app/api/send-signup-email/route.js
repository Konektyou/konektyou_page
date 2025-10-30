import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { appendJsonRecord } from '@/lib/storage';
import { connectToDatabase } from '@/lib/mongodb';
import ClientSignup from '@/models/ClientSignup';

export async function POST(request) {
  try {
    const { name, email, phone, service, area, time } = await request.json();

    // Save to local JSON "DB" (non-fatal)
    try {
      await appendJsonRecord('clientSignups.json', { name, email, phone, service, area, time });
    } catch (e) {
      console.error('Storage error (non-fatal):', e);
    }

    // Create transporter using Microsoft 365 SMTP (client-provided credentials)
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: 'hello@konektly.ca',
        pass: 'Welcome@123',
      },
      // Office 365 typically negotiates TLS automatically; avoid forcing legacy ciphers
      tls: { minVersion: 'TLSv1.2' }
    });

    // Email content
    const mailOptions = {
      from: 'hello@konektly.ca',
      to: ['info@konektly.ca', 'andy@konektly.ca'],
      subject: `New User Signup - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
            New User Registration
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #000; margin-top: 0;">User Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Service Needed:</strong> ${service}</p>
            <p><strong>Area:</strong> ${area}</p>
            <p><strong>Preferred Time:</strong> ${time}</p>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1976d2;">
              <strong>Next Steps:</strong> Please contact this user to confirm their service request and connect them with available professionals.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              This email was sent from the Konektly platform
            </p>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // After successful email, save to MongoDB
    try {
      await connectToDatabase();
      await ClientSignup.create({ name, email, phone, service, area, time });
    } catch (dbErr) {
      console.error('Mongo save error (non-fatal):', dbErr);
    }

    return NextResponse.json({ success: true, message: 'Signup email sent successfully' });
  } catch (error) {
    console.error('Error sending signup email:', {
      message: error?.message,
      code: error?.code,
      response: error?.response,
    });
    return NextResponse.json(
      { success: false, message: 'Failed to send signup email' },
      { status: 500 }
    );
  }
}
