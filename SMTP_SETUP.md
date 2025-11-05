# SMTP Email Configuration Guide

## Issue
The error `535 5.7.139 Authentication unsuccessful, SmtpClientAuthentication is disabled for the Tenant` indicates that SMTP authentication is disabled in your Microsoft 365/Outlook tenant.

## Solutions

### Option 1: Enable SMTP AUTH in Microsoft 365 (Recommended)
1. Sign in to the [Microsoft 365 admin center](https://admin.microsoft.com)
2. Go to **Settings** > **Org settings** > **Mail**
3. Find **SMTP AUTH** and enable it for your tenant
4. Or use PowerShell:
   ```powershell
   Set-TransportConfig -SmtpClientAuthenticationDisabled $false
   ```

### Option 2: Use App Password (Microsoft 365)
If you have 2FA enabled, you'll need to use an App Password instead of your regular password:
1. Go to [Microsoft Account Security](https://account.microsoft.com/security)
2. Enable 2FA if not already enabled
3. Go to **Security** > **Advanced security options** > **App passwords**
4. Create a new app password for "Mail"
5. Use this app password in your `SMTP_PASS` environment variable

### Option 3: Use GoDaddy Workspace Email (Alternative)
If you prefer to use GoDaddy's SMTP server instead:
1. Set `SMTP_HOST=smtpout.secureserver.net` in your `.env` file
2. Keep `SMTP_PORT=587`
3. Use your GoDaddy email credentials

## Environment Variables

Create a `.env` file in the root directory with:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://konektly.ca

# SMTP Email Configuration
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=hello@konektly.ca
SMTP_PASS=your_password_or_app_password_here
```

## After Configuration

1. Restart your PM2 process:
   ```bash
   pm2 restart konektyo
   ```

2. Test the email functionality by submitting a signup form

3. Check the logs:
   ```bash
   pm2 logs konektyo
   ```

## Notes
- The app will continue to work even if email fails (signups are still saved to the database)
- Email errors are logged but don't break the signup process
- Make sure your `.env` file is in `.gitignore` (already configured)

