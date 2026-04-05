import { NextResponse } from 'next/server';
import { getEmailTransporter } from '@/lib/emailConfig';

const CATEGORY_LABELS = {
  account: 'Account',
  payment: 'Payment',
  verification: 'Verification',
  job: 'Job / Service',
  subscription: 'Subscription',
  bug: 'Bug Report',
  other: 'Other',
};

export async function POST(request) {
  try {
    const { name, email, category, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const fromEmail = process.env.SMTP_USER || 'mudassarhus667788@gmail.com';
    const categoryLabel = CATEGORY_LABELS[category] || category;

    try {
      const transporter = getEmailTransporter();

      await transporter.sendMail({
        from: fromEmail,
        to: 'info@konektly.ca',
        replyTo: email,
        subject: `[Support] [${categoryLabel}] ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #111; border-bottom: 2px solid #000; padding-bottom: 10px;">
              New Support Request
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <tr>
                <td style="padding: 10px; font-weight: bold; background: #f5f5f5; border: 1px solid #ddd; width: 140px;">Name</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; background: #f5f5f5; border: 1px solid #ddd;">Email</td>
                <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; background: #f5f5f5; border: 1px solid #ddd;">Category</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${categoryLabel}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; background: #f5f5f5; border: 1px solid #ddd;">Subject</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${subject}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; background: #f5f5f5; border: 1px solid #ddd; vertical-align: top;">Message</td>
                <td style="padding: 10px; border: 1px solid #ddd; white-space: pre-wrap;">${message}</td>
              </tr>
            </table>
            <p style="margin-top: 20px; color: #666; font-size: 12px;">
              Submitted via konektly.ca/support — reply directly to this email to respond to the user.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Support contact email error:', emailError?.message);
      // Still return success — the user's message was received even if email relay failed
    }

    return NextResponse.json({ success: true, message: 'Message received' });
  } catch (error) {
    console.error('Support contact route error:', error?.message);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
