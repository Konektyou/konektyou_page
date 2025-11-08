import { NextResponse } from 'next/server';
import { appendJsonRecord } from '@/lib/storage';
import { connectToDatabase } from '@/lib/mongodb';
import ProviderSignup from '@/models/ProviderSignup';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { name, email, phone, serviceType, experience, area, businessName, documents, photo } = await request.json();

    // Save provider data to local JSON "DB" (non-fatal)
    try {
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
    } catch (e) {
      console.error('Storage error (non-fatal):', e);
    }

    // Save to MongoDB (mandatory)
    await connectToDatabase();
    await ProviderSignup.create({
      name,
      email,
      phone,
      serviceType,
      experience,
      area,
      businessName,
      documents: documents || [],
      photoName: photo?.name || null,
    });

    // Send email after successful database save
    try {
      // Get email configuration from environment variables
      const smtpHost = process.env.SMTP_HOST || 'smtp.hostinger.com';
      const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
      const smtpUser = process.env.SMTP_USER || 'hello@konektly.ca';
      const smtpPass = process.env.SMTP_PASS || 'thisisit@2025';
      
      console.log('Email configuration:', {
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        hasPassword: !!smtpPass
      });
      
      // If no password is set, skip email sending
      if (!smtpPass) {
        console.warn('SMTP_PASS not configured, skipping email send');
        // Continue to return success response below
      } else {
        // Determine if using SSL (port 465) or TLS (port 587)
        const useSSL = smtpPort === 465;

        // Create transporter with SMTP settings (supports Hostinger, Office365, etc.)
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: useSSL, // true for SSL (port 465), false for STARTTLS (port 587)
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false,
          },
          debug: true, // Enable debug output
          logger: true, // Enable logging
        });

        // Verify connection before sending
        try {
          await transporter.verify();
          console.log('SMTP connection verified successfully');
        } catch (verifyError) {
          console.error('SMTP verification failed:', {
            message: verifyError?.message,
            code: verifyError?.code,
            response: verifyError?.response,
          });
          throw verifyError;
        }

      // Email content
      const mailOptions = {
        from: 'hello@konektly.ca',
        to: 'konektdemo@gmail.com',
        subject: `New Provider Signup: ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
              New Provider Signup
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
                  <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Service Type:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${serviceType || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Experience:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${experience || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Service Area:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${area || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Business Name:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${businessName || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Documents:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${documents && documents.length > 0 ? documents.join(', ') : 'No documents uploaded'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Photo:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${photo?.name || 'No photo uploaded'}</td>
                </tr>
              </table>
            </div>
            <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #000;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                This provider signup has been successfully saved to the database.
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

    return NextResponse.json({ success: true, message: 'Provider signup saved successfully' });
  } catch (error) {
    console.error('Error saving provider signup:', {
      message: error?.message,
      code: error?.code,
      response: error?.response,
    });
    return NextResponse.json(
      { success: false, message: 'Failed to save provider signup' },
      { status: 500 }
    );
  }
}
