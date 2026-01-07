# SMTP Email Configuration Guide - GoDaddy

## Domain: GoDaddy
Your domain `konektly.ca` is hosted on GoDaddy, so we're using GoDaddy Workspace Email SMTP settings.

## GoDaddy SMTP Settings

### Standard Configuration
GoDaddy Workspace Email uses these SMTP settings:

- **SMTP Host:** `smtpout.secureserver.net`
- **Port:** `587` (TLS/STARTTLS) - Recommended
- **Alternative Port:** `465` (SSL) - If 587 doesn't work
- **Username:** Your full email address (e.g., `hello@konektly.ca`)
- **Password:** Your GoDaddy email account password

## Environment Variables

Create a `.env` file in the root directory with:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://konektly.ca

# SMTP Email Configuration - GoDaddy
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=587
SMTP_USER=hello@konektly.ca
SMTP_PASS=your_godaddy_email_password_here
```

### Alternative: Port 465 (SSL)
If port 587 doesn't work, try port 465:

```env
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=465
SMTP_USER=hello@konektly.ca
SMTP_PASS=your_godaddy_email_password_here
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

## Troubleshooting

### Error: "SmtpClientAuthentication is disabled for the Tenant" (Microsoft 365)

**Problem:** You're seeing this error:
```
535 5.7.139 Authentication unsuccessful, SmtpClientAuthentication is disabled for the Tenant
```

**Solution:** This error occurs when trying to use Microsoft 365/Office365 SMTP. The code now defaults to GoDaddy SMTP. To fix:

1. **Ensure you're using GoDaddy SMTP:**
   - Check your `.env` file has `SMTP_HOST=smtpout.secureserver.net`
   - If it's set to `smtp.office365.com`, change it to GoDaddy
   - Or remove `SMTP_HOST` from `.env` to use the default (GoDaddy)

2. **Verify Environment Variables:**
   Make sure your `.env` file in the project root contains:
   ```env
   SMTP_HOST=smtpout.secureserver.net
   SMTP_PORT=587
   SMTP_USER=hello@konektly.ca
   SMTP_PASS=your_godaddy_email_password
   ```

3. **Restart PM2:**
   ```bash
   pm2 restart konektyo
   ```

4. **Check Logs:**
   ```bash
   pm2 logs konektyo --lines 50
   ```
   Look for `SMTP Configuration:` log entry - it should show:
   - `host: smtpout.secureserver.net`
   - `usingGoDaddy: true`

### If emails are not sending:

1. **Verify GoDaddy Email Account:**
   - Log into your GoDaddy account
   - Go to Workspace Email settings
   - Make sure the email account `hello@konektly.ca` exists and is active
   - Verify the password is correct

2. **Check Port Settings:**
   - Try port 587 first (TLS)
   - If that doesn't work, try port 465 (SSL)
   - Update `SMTP_PORT` in `.env` and restart PM2

3. **Check Server Logs:**
   ```bash
   pm2 logs konektyo --lines 100
   ```
   Look for:
   - `SMTP Configuration:` log showing `host: smtpout.secureserver.net` (should show GoDaddy, not Outlook)
   - `usingGoDaddy: true`
   - Any error messages

4. **Verify Environment Variables:**
   Make sure your `.env` file is in the project root and contains:
   ```env
   SMTP_HOST=smtpout.secureserver.net
   SMTP_PORT=587
   SMTP_USER=hello@konektly.ca
   SMTP_PASS=your_actual_password
   ```

## Notes
- The app will continue to work even if email fails (signups are still saved to the database)
- Email errors are logged but don't break the signup process
- Make sure your `.env` file is in `.gitignore` (already configured)
- The code now **defaults to GoDaddy** - it will use `smtpout.secureserver.net` by default
- If you need to use a different SMTP provider, set `SMTP_HOST` in your `.env` file

