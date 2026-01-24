import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Provider from '@/models/Provider';
import Service from '@/models/Service';
import Client from '@/models/Client';
import Payment from '@/models/Payment';
import AdminSettings from '@/models/AdminSettings';
import { getEmailTransporter } from '@/lib/emailConfig';
const jwt = require('jsonwebtoken');

// Stripe integration
const Stripe = require('stripe');

export async function POST(request) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const clientId = decoded.id;

    const {
      providerId,
      serviceId,
      duration,
      startDateTime,
      endTime,
      workLocation,
      amount, // This should be the total amount including tax
      baseAmount // Provider's base price (before tax)
    } = await request.json();

    // Validate required fields
    if (!providerId || !duration || !startDateTime || !workLocation || !amount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if client has active premium subscription for current month
    // Once subscribed in a month, they can book unlimited providers without paying again
    const now = new Date();
    const hasActiveSubscription = 
      client.subscription?.status === 'active' &&
      client.subscription?.planType === 'premium' &&
      (!client.subscription?.endDate || new Date(client.subscription.endDate) > now) &&
      (!client.subscription?.startDate || new Date(client.subscription.startDate) <= now);

    if (!hasActiveSubscription) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Premium subscription required to book talent. Please subscribe to continue.',
          requiresSubscription: true
        },
        { status: 403 }
      );
    }

    // Verify provider exists and is available
    const provider = await Provider.findById(providerId);
    if (!provider || !provider.isActive || provider.isBanned) {
      return NextResponse.json(
        { success: false, message: 'Provider not available' },
        { status: 400 }
      );
    }

    // Get admin settings for tax rate
    const adminSettings = await AdminSettings.getSettings();
    const taxRate = adminSettings.taxRate / 100; // Convert percentage to decimal
    
    // Calculate amounts
    // baseAmount = provider's set price (before tax)
    // taxAmount = baseAmount × taxRate
    // amount = baseAmount + taxAmount (total client pays)
    const calculatedBaseAmount = baseAmount || amount; // Use provided baseAmount or fallback to amount
    const calculatedTaxAmount = calculatedBaseAmount * taxRate;
    const totalAmount = calculatedBaseAmount + calculatedTaxAmount;

    // Create booking
    // IMPORTANT: 
    // - baseAmount = provider's set price (e.g., $10/hour × duration)
    // - taxAmount = tax on provider's price
    // - amount = baseAmount + taxAmount (total client pays)
    // - Commission is NOT added to client's price, it's deducted from provider earnings
    const booking = await Booking.create({
      clientId,
      providerId,
      serviceId: serviceId || null,
      startTime: new Date(startDateTime),
      endTime: new Date(endTime),
      duration,
      workLocation,
      baseAmount: calculatedBaseAmount, // Provider's base price (before tax)
      taxAmount: calculatedTaxAmount, // Tax amount
      taxRate: adminSettings.taxRate, // Tax rate at time of booking
      amount: totalAmount, // Total amount client pays (baseAmount + tax)
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Create payment intent with Stripe
    let clientSecret = null;
    let paymentIntentId = null;

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51MAu7gI7BEvOC2zJTYQxB3JsfS5rINOJylLzJuhWTG3p4WAvTRQ1us6Fof8Z2UZEi15rxmAyXTbNnny1stNz4d7200w9BfzrOR');
      
      // Create Stripe payment intent for the total amount (provider's price + tax)
      // Client pays: baseAmount + taxAmount
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents - total including tax
        currency: 'cad',
        metadata: {
          bookingId: booking._id.toString(),
          clientId: clientId.toString(),
          providerId: providerId.toString(),
          baseAmount: calculatedBaseAmount.toString(),
          taxAmount: calculatedTaxAmount.toString()
        }
      });

      clientSecret = paymentIntent.client_secret;
      paymentIntentId = paymentIntent.id;

      // Update booking with payment intent ID
      booking.paymentIntentId = paymentIntentId;
      await booking.save();
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      // Don't fail the booking creation if Stripe fails
      // The payment can be retried later
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking._id.toString(),
        status: booking.status,
        amount: booking.amount
      },
      clientSecret: clientSecret
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Webhook handler for Stripe payment confirmation
export async function PUT(request) {
  try {
    await connectToDatabase();

    const { bookingId, paymentIntentId, paymentStatus } = await request.json();

    if (!bookingId || !paymentIntentId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking payment status
    booking.paymentStatus = paymentStatus === 'succeeded' ? 'paid' : 'failed';
    booking.stripePaymentId = paymentIntentId;

    if (paymentStatus === 'succeeded') {
      // Keep status as 'pending' - provider needs to accept/reject
      booking.status = 'pending';
      
      // Don't create payment record yet - wait for provider acceptance

      // Send email notification to provider about booking request
      try {
        // Fetch provider and client details
        const provider = await Provider.findById(booking.providerId).select('name email');
        const client = await Client.findById(booking.clientId).select('name email phone');
        const service = booking.serviceId ? await Service.findById(booking.serviceId).select('name') : null;

        if (provider && provider.email) {
          // Create transporter with GoDaddy Workspace Email SMTP settings
          const transporter = getEmailTransporter();

          // Format dates
          const startDate = new Date(booking.startTime).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          const endDate = new Date(booking.endTime).toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          });

          // Email content - Booking Request
          const mailOptions = {
            from: process.env.SMTP_USER || process.env.EMAIL_USER || 'mudassarhus667788@gmail.com',
            to: provider.email,
            subject: `New Booking Request - ${client?.name || 'Client'}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
                  New Booking Request 📋
                </h2>
                <div style="margin-top: 20px;">
                  <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                    Hello ${provider.name},
                  </p>
                  <p style="color: #666; line-height: 1.6;">
                    You have received a new booking request! The client has already made the payment. Please review the details and accept or reject this booking request.
                  </p>
                  
                  <div style="margin-top: 30px; background-color: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #000;">
                    <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">Booking Request Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd; width: 40%;">Booking ID:</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${bookingId}</td>
                      </tr>
                      ${service ? `
                      <tr>
                        <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Service:</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${service.name}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Client Name:</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${client?.name || 'N/A'}</td>
                      </tr>
                      ${client?.email ? `
                      <tr>
                        <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Client Email:</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${client.email}</td>
                      </tr>
                      ` : ''}
                      ${client?.phone ? `
                      <tr>
                        <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Client Phone:</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${client.phone}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Start Time:</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${startDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">End Time:</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${endDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Duration:</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${booking.duration} hours</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Location:</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">
                          ${booking.workLocation.address}<br>
                          ${booking.workLocation.city}, ${booking.workLocation.province}
                          ${booking.workLocation.postalCode ? `<br>${booking.workLocation.postalCode}` : ''}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Total Amount:</td>
                        <td style="padding: 10px; border: 1px solid #ddd; font-size: 18px; font-weight: bold; color: #000;">$${booking.amount.toFixed(2)}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                    <p style="margin: 0; color: #856404; font-size: 14px; font-weight: bold;">
                      ⚠️ Action Required:
                    </p>
                    <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #856404; font-size: 14px;">
                      <li>Please log in to your provider dashboard to accept or reject this booking request</li>
                      <li>If you accept, the booking will be confirmed and you'll receive payment</li>
                      <li>If you reject, the client will receive a full refund automatically</li>
                    </ul>
                  </div>
                  
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
                    <p style="color: #666; font-size: 12px; margin: 0;">
                      This is an automated notification from Konektly.<br>
                      Please do not reply to this email.
                    </p>
                  </div>
                </div>
              </div>
            `,
          };

          // Send email
          const info = await transporter.sendMail(mailOptions);
          console.log('Booking request email sent to provider:', {
            messageId: info.messageId,
            to: provider.email,
            bookingId: bookingId
          });
        }
      } catch (emailError) {
        // Log email error but don't fail the request
        console.error('Error sending booking request email to provider:', {
          message: emailError?.message,
          code: emailError?.code,
          response: emailError?.response,
          responseCode: emailError?.responseCode,
          bookingId: bookingId
        });
        
        // If authentication failed, log a helpful message
        if (emailError?.code === 'EAUTH' || emailError?.responseCode === 535) {
          console.error('SMTP Authentication Failed - Please verify:');
          console.error('1. Email account exists: mudassarhus667788@gmail.com');
          console.error('2. Gmail App Password is correct (not regular password)');
          console.error('3. Try port 465 (SSL) if port 587 fails');
        }
      }
    }

    await booking.save();

    return NextResponse.json({
      success: true,
      booking: {
        id: booking._id.toString(),
        status: booking.status,
        paymentStatus: booking.paymentStatus
      }
    });
  } catch (error) {
    console.error('Error updating booking payment:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

