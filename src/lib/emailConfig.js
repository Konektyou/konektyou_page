import nodemailer from 'nodemailer';

// Centralized email configuration
// Uses environment variables if available, otherwise falls back to Gmail defaults

// Get the from email address (used in mailOptions.from)
export const getFromEmail = () => {
  return process.env.SMTP_USER || process.env.EMAIL_USER || 'mudassarhus667788@gmail.com';
};

// Get email transporter for sending emails
export const getEmailTransporter = () => {
  const port = parseInt(process.env.SMTP_PORT || '587');
  const useSSL = port === 465;
  
  // Default to Gmail SMTP server
  // For Gmail: smtp.gmail.com
  // For Outlook/Office365: smtp.office365.com
  // For GoDaddy: smtpout.secureserver.net
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  
  const smtpConfig = {
    host: smtpHost,
    port: port,
    secure: useSSL, // true for SSL (port 465), false for STARTTLS (port 587)
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER || 'mudassarhus667788@gmail.com',
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || 'jvoiyhvrnkjcrevt',
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
    usingGmail: smtpHost.includes('gmail'),
    usingGoDaddy: smtpHost.includes('secureserver'),
    usingOffice365: smtpHost.includes('office365')
  });

  return nodemailer.createTransport(smtpConfig);
};

