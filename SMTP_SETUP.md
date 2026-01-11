# SMTP Email Configuration Guide - Gmail

## Email Provider: Gmail
The application is configured to use Gmail SMTP for sending emails.

## Gmail SMTP Settings

### Standard Configuration
Gmail uses these SMTP settings:

- **SMTP Host:** `smtp.gmail.com`
- **Port:** `587` (TLS/STARTTLS) - Recommended
- **Alternative Port:** `465` (SSL) - If 587 doesn't work
- **Username:** Your full Gmail address (e.g., `mudassarhus667788@gmail.com`)
- **Password:** Your Gmail App Password (not your regular Gmail password)

### Important: Gmail App Password Required
Gmail requires an **App Password** for SMTP authentication, not your regular Gmail password. To generate an App Password:

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (must be enabled)
3. Scroll down to **App passwords**
4. Generate a new app password for "Mail"
5. Use this 16-character password in your configuration

## Environment Variables

Create a `.env` file in the root directory with:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://konektly.ca

# SMTP Email Configuration - Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=mudassarhus667788@gmail.com
SMTP_PASS=jvoiyhvrnkjcrevt

# Alternative: You can also use EMAIL_USER and EMAIL_PASS
EMAIL_USER=mudassarhus667788@gmail.com
EMAIL_PASS=jvoiyhvrnkjcrevt
```

### Alternative: Port 465 (SSL)
If port 587 doesn't work, try port 465:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=mudassarhus667788@gmail.com
SMTP_PASS=jvoiyhvrnkjcrevt
```

## Default Configuration
If environment variables are not set, the application defaults to:
- **Host:** `smtp.gmail.com`
- **Port:** `587`
- **User:** `mudassarhus667788@gmail.com`
- **Password:** `jvoiyhvrnkjcrevt`

## After Configuration

1. Restart your PM2 process:
   ```bash
   pm2 restart konektyo
   ```

2. Test the email functionality by submitting a signup form or logging in

3. Check the logs:
   ```bash
   pm2 logs konektyo
   ```
   Look for `SMTP Configuration:` log entry showing:
   - `host: smtp.gmail.com`
   - `usingGmail: true`

## Troubleshooting

### Error: "Invalid login" or "Authentication failed"

**Problem:** You're seeing authentication errors when sending emails.

**Solution:**
1. **Verify Gmail App Password:**
   - Make sure you're using an App Password, not your regular Gmail password
   - App Passwords are 16 characters long
   - Generate a new one if needed: https://myaccount.google.com/apppasswords

2. **Check 2-Step Verification:**
   - App Passwords require 2-Step Verification to be enabled
   - Enable it here: https://myaccount.google.com/security

3. **Verify Environment Variables:**
   Make sure your `.env` file in the project root contains:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=mudassarhus667788@gmail.com
   SMTP_PASS=your_app_password_here
   ```

4. **Try Port 465:**
   If port 587 doesn't work, try port 465 (SSL):
   ```env
   SMTP_PORT=465
   ```

5. **Check Server Logs:**
   ```bash
   pm2 logs konektyo --lines 100
   ```
   Look for:
   - `SMTP Configuration:` log showing `host: smtp.gmail.com`
   - `usingGmail: true`
   - Any error messages

### Error: "SmtpClientAuthentication is disabled" (Microsoft 365)

**Note:** This error occurs if you try to use Microsoft 365 SMTP. The application now defaults to Gmail. If you see this error, ensure your `.env` file has `SMTP_HOST=smtp.gmail.com` or remove `SMTP_HOST` to use the default.

### If emails are still not sending:

1. **Check Gmail Account:**
   - Log into Gmail and verify the account is active
   - Check if "Less secure app access" is enabled (if using regular password, but App Password is preferred)
   - Verify the App Password is correct

2. **Check Port Settings:**
   - Try port 587 first (TLS)
   - If that doesn't work, try port 465 (SSL)
   - Update `SMTP_PORT` in `.env` and restart PM2

3. **Verify Environment Variables:**
   Make sure your `.env` file is in the project root and contains:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=mudassarhus667788@gmail.com
   SMTP_PASS=your_app_password_here
   ```

## Notes
- The app will continue to work even if email fails (signups are still saved to the database)
- Email errors are logged but don't break the signup/login process
- Make sure your `.env` file is in `.gitignore` (already configured)
- The code defaults to Gmail SMTP (`smtp.gmail.com`) if no environment variables are set
- Always use Gmail App Passwords, never your regular Gmail password
