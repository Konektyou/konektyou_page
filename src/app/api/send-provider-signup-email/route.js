import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { appendJsonRecord } from '@/lib/storage';

export async function POST(request) {
  try {
    const { name, email, phone, serviceType, experience, area, businessName, documents, photo } = await request.json();

    // Save provider data to local JSON "DB"
    await appendJsonRecord('providerSignups.json', {
      name,
      email,
      phone,
      serviceType,
      experience,
      area,
      businessName,
      documents,
      photoName: photo?.name || null
    });

    // Create transporter using Microsoft 365 SMTP (client-provided credentials)
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false, // use STARTTLS
      auth: {
        user: 'hello@konektly.ca',
        pass: 'Welcome@123',
      },
      tls: {
        ciphers: 'SSLv3'
      }
    });

    // Email content
    const mailOptions = {
      from: 'hello@konektly.ca',
      to: ['info@konektly.ca', 'andy@konektly.ca'],
      subject: `New Service Provider Registration - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
            New Service Provider Registration
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #000; margin-top: 0;">Provider Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Service Type:</strong> ${serviceType}</p>
            <p><strong>Experience:</strong> ${experience}</p>
            <p><strong>Service Area:</strong> ${area}</p>
            <p><strong>Business Name:</strong> ${businessName}</p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #856404; margin-top: 0;">Documents Uploaded:</h4>
            <ul style="color: #856404; margin: 0;">
              ${(documents || []).map(doc => `<li>${doc}</li>`).join('')}
            </ul>
            <p style="color: #856404; margin: 10px 0 0 0;">
              <strong>Profile Photo:</strong> ${photo?.name || 'Not uploaded'}
            </p>
          </div>
          
          <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0c5460;">
              <strong>Verification Required:</strong> Please review the uploaded documents and verify this provider's credentials before activating their profile.
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

    return NextResponse.json({ success: true, message: 'Provider signup email sent successfully' });
  } catch (error) {
    console.error('Error sending provider signup email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send provider signup email' },
      { status: 500 }
    );
  }
}
