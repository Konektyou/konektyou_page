import nodemailer from 'nodemailer';

// Centralized email configuration
// Uses environment variables if available, otherwise falls back to defaults
// Defaults to GoDaddy SMTP server for konektly.ca domain
export const getEmailTransporter = () => {
  const port = parseInt(process.env.SMTP_PORT || '587');
  const useSSL = port === 465;
  
  // For Outlook/Office365 emails, use smtp.office365.com
  // For GoDaddy emails, use smtpout.secureserver.net
  const smtpHost = process.env.SMTP_HOST || 'smtp.office365.com';
  
  const smtpConfig = {
    host: smtpHost,
    port: port,
    secure: useSSL, // true for SSL (port 465), false for STARTTLS (port 587)
    auth: {
      user: process.env.SMTP_USER || 'hello@konektly.ca',
      pass: process.env.SMTP_PASS || 'thisisit@2025',
    },
  };

  // Only add TLS config for STARTTLS (port 587)
  // Removed SSLv3 cipher as it's deprecated and causes authentication failures
  if (!useSSL) {
    smtpConfig.tls = {
      rejectUnauthorized: false,
      // Use modern TLS settings
      minVersion: 'TLSv1.2',
    }; 
  }

  // Log SMTP configuration (without password) for debugging
  console.log('SMTP Configuration:', {
    host: smtpHost,
    port: port,
    secure: useSSL,
    user: smtpConfig.auth.user,
    usingGoDaddy: smtpHost.includes('secureserver'),
    usingOffice365: smtpHost.includes('office365')
  });

  return nodemailer.createTransport(smtpConfig);
};

