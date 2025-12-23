import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Provider from '@/models/Provider';
import Client from '@/models/Client';
import Service from '@/models/Service';
import { getEmailTransporter } from '@/lib/emailConfig';
const jwt = require('jsonwebtoken');
const Stripe = require('stripe');

export async function POST(request, { params }) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const providerId = decoded.id;

    const { id } = await params;
    const { reason } = await request.json();

    // Find booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify provider owns this booking
    if (booking.providerId.toString() !== providerId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if booking is in pending status
    if (booking.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'Booking cannot be rejected in current status' },
        { status: 400 }
      );
    }

    // Process refund
    let refundId = null;
    if (booking.paymentStatus === 'paid' && booking.stripePaymentId) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51MAu7gI7BEvOC2zJTYQxB3JsfS5rINOJylLzJuhWTG3p4WAvTRQ1us6Fof8Z2UZEi15rxmAyXTbNnny1stNz4d7200w9BfzrOR');
        
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripePaymentId);
        
        if (paymentIntent.latest_charge) {
          const refund = await stripe.refunds.create({
            charge: paymentIntent.latest_charge,
            amount: Math.round(booking.amount * 100),
            reason: 'requested_by_customer',
            metadata: {
              bookingId: booking._id.toString(),
              clientId: booking.clientId.toString(),
              reason: reason || 'Provider rejected booking'
            }
          });
          
          refundId = refund.id;
        }
      } catch (stripeError) {
        console.error('Stripe refund error:', stripeError);
        // Continue with rejection even if refund fails
      }
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = 'provider';
    if (refundId) {
      booking.paymentStatus = 'refunded';
    }
    if (reason) {
      booking.notes = booking.notes ? `${booking.notes}\nRejection reason: ${reason}` : `Rejection reason: ${reason}`;
    }
    await booking.save();

    // Send email notification to client
    try {
      const provider = await Provider.findById(booking.providerId).select('name email');
      const client = await Client.findById(booking.clientId).select('name email');
      const service = booking.serviceId ? await Service.findById(booking.serviceId).select('name') : null;

      if (client && client.email) {
        const transporter = getEmailTransporter();

        const startDate = new Date(booking.startTime).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const mailOptions = {
          from: 'hello@konektly.ca',
          to: client.email,
          subject: `Booking Request Declined - ${provider?.name || 'Provider'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
                Booking Request Declined
              </h2>
              <div style="margin-top: 20px;">
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                  Hello ${client.name},
                </p>
                <p style="color: #666; line-height: 1.6;">
                  We're sorry to inform you that ${provider?.name || 'the provider'} has declined your booking request.
                </p>
                
                <div style="margin-top: 30px; background-color: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #000;">
                  <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">Booking Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd; width: 40%;">Booking ID:</td>
                      <td style="padding: 10px; border: 1px solid #ddd;">${id}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Provider:</td>
                      <td style="padding: 10px; border: 1px solid #ddd;">${provider?.name || 'N/A'}</td>
                    </tr>
                    ${service ? `
                    <tr>
                      <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Service:</td>
                      <td style="padding: 10px; border: 1px solid #ddd;">${service.name}</td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Scheduled Date:</td>
                      <td style="padding: 10px; border: 1px solid #ddd;">${startDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">Amount:</td>
                      <td style="padding: 10px; border: 1px solid #ddd; font-size: 18px; font-weight: bold; color: #000;">$${booking.amount.toFixed(2)}</td>
                    </tr>
                  </table>
                </div>
                
                ${refundId ? `
                <div style="margin-top: 30px; padding: 15px; background-color: #d1ecf1; border-left: 4px solid #17a2b8; border-radius: 4px;">
                  <p style="margin: 0; color: #0c5460; font-size: 14px; font-weight: bold;">
                    💰 Refund Processed
                  </p>
                  <p style="margin: 10px 0 0 0; color: #0c5460; font-size: 14px;">
                    A full refund of $${booking.amount.toFixed(2)} has been processed and will appear in your account within 5-10 business days.
                  </p>
                </div>
                ` : ''}
                
                ${reason ? `
                <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                  <p style="margin: 0; color: #856404; font-size: 14px; font-weight: bold;">
                    Reason:
                  </p>
                  <p style="margin: 10px 0 0 0; color: #856404; font-size: 14px;">
                    ${reason}
                  </p>
                </div>
                ` : ''}
                
                <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #6c757d; border-radius: 4px;">
                  <p style="margin: 0; color: #495057; font-size: 14px;">
                    You can browse other providers and book a new service anytime. We apologize for any inconvenience.
                  </p>
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

        await transporter.sendMail(mailOptions);
        console.log('Booking rejection email sent to client:', {
          to: client.email,
          bookingId: id,
          refundId: refundId
        });
      }
    } catch (emailError) {
      console.error('Error sending rejection email to client:', {
        message: emailError?.message,
        code: emailError?.code,
        response: emailError?.response,
        responseCode: emailError?.responseCode
      });
      
      // If authentication failed, log a helpful message
      if (emailError?.code === 'EAUTH' || emailError?.responseCode === 535) {
        console.error('SMTP Authentication Failed - Please verify:');
        console.error('1. Email account exists: hello@konektly.ca');
        console.error('2. Password is correct in GoDaddy account');
        console.error('3. Try port 465 (SSL) if port 587 fails');
      }
    }

    return NextResponse.json({
      success: true,
      message: refundId ? 'Booking rejected and refund processed' : 'Booking rejected successfully',
      booking: {
        id: booking._id.toString(),
        status: booking.status,
        paymentStatus: booking.paymentStatus
      },
      refundId: refundId
    });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

