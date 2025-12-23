import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Provider from '@/models/Provider';
import Client from '@/models/Client';
import Service from '@/models/Service';
import Payment from '@/models/Payment';
import { getEmailTransporter } from '@/lib/emailConfig';
const jwt = require('jsonwebtoken');

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
        { success: false, message: 'Booking cannot be accepted in current status' },
        { status: 400 }
      );
    }

    // Update booking status to confirmed
    booking.status = 'confirmed';
    await booking.save();

    // Create payment record
    await Payment.create({
      providerId: booking.providerId,
      bookingId: booking._id,
      serviceId: booking.serviceId,
      amount: booking.amount,
      status: 'completed',
      paymentType: 'earned',
      description: `Payment for booking ${id}`,
      completedAt: new Date()
    });

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
        const endDate = new Date(booking.endTime).toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });

        const mailOptions = {
          from: 'hello@konektly.ca',
          to: client.email,
          subject: `Booking Confirmed - ${provider?.name || 'Provider'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
                Booking Confirmed! ✅
              </h2>
              <div style="margin-top: 20px;">
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                  Hello ${client.name},
                </p>
                <p style="color: #666; line-height: 1.6;">
                  Great news! Your booking request has been accepted by ${provider?.name || 'the provider'}. Your booking is now confirmed.
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
                
                <div style="margin-top: 30px; padding: 15px; background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 4px;">
                  <p style="margin: 0; color: #155724; font-size: 14px; font-weight: bold;">
                    ✅ Your booking is confirmed!
                  </p>
                  <p style="margin: 10px 0 0 0; color: #155724; font-size: 14px;">
                    You can view and manage your booking in your client dashboard. If you need to contact the provider, you can use the messaging feature.
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
        console.log('Booking acceptance email sent to client:', {
          to: client.email,
          bookingId: id
        });
      }
    } catch (emailError) {
      console.error('Error sending acceptance email to client:', {
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
      message: 'Booking accepted successfully',
      booking: {
        id: booking._id.toString(),
        status: booking.status,
        paymentStatus: booking.paymentStatus
      }
    });
  } catch (error) {
    console.error('Error accepting booking:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

