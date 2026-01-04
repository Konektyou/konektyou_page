import nodemailer from 'nodemailer';

// Centralized email configuration
// Uses environment variables if available, otherwise falls back to defaults
export const getEmailTransporter = () => {
  const port = parseInt(process.env.SMTP_PORT || '587');
  const useSSL = port === 465;
  
  const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
    port: port,
    secure: useSSL, // true for SSL (port 465), false for STARTTLS (port 587)
    auth: {
      user: 'hello@konektly.ca',
      pass: 'thisisit@2025',
    },
  };

  // Only add TLS config for STARTTLS (port 587)
  if (!useSSL) {
    smtpConfig.tls = {
      ciphers: 'SSLv3',
      rejectUnauthorized: false,
    }; 
  }

  return nodemailer.createTransport(smtpConfig);
};

