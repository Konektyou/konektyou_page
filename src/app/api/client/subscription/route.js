import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Client from '@/models/Client';
import AdminSettings from '@/models/AdminSettings';
const jwt = require('jsonwebtoken');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Get subscription status
export async function GET(request) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const clientId = decoded.id;

    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json({ success: false, message: 'Client not found' }, { status: 404 });
    }

    // Check if subscription is active for current month
    // A subscription is active if:
    // 1. Status is 'active'
    // 2. Plan type is 'premium'
    // 3. End date is in the future (subscription hasn't expired)
    // 4. Start date is in the past (subscription has started)
    const now = new Date();
    const isActive = 
      client.subscription?.status === 'active' &&
      client.subscription?.planType === 'premium' &&
      (!client.subscription?.endDate || new Date(client.subscription.endDate) > now) &&
      (!client.subscription?.startDate || new Date(client.subscription.startDate) <= now);

    return NextResponse.json({
      success: true,
      subscription: client.subscription || null,
      isActive
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}

// Create or update subscription
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

    const { planType } = await request.json();

    if (!planType || planType !== 'premium') {
      return NextResponse.json(
        { success: false, message: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Get subscription price from admin settings
    const adminSettings = await AdminSettings.getSettings();
    const subscriptionPrice = adminSettings.clientSubscriptionPrice || 50;

    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json({ success: false, message: 'Client not found' }, { status: 404 });
    }

    // Check if already has active subscription for current month
    const now = new Date();
    const hasActiveSubscription = 
      client.subscription?.status === 'active' &&
      client.subscription?.planType === 'premium' &&
      (!client.subscription?.endDate || new Date(client.subscription.endDate) > now) &&
      (!client.subscription?.startDate || new Date(client.subscription.startDate) <= now);

    if (hasActiveSubscription) {
      return NextResponse.json({
        success: true,
        message: 'Subscription already active',
        subscription: client.subscription
      });
    }

    // Create Stripe checkout session
    let checkoutUrl = null;
    let stripeCustomerId = client.subscription?.stripeCustomerId;

    if (stripe && process.env.STRIPE_SECRET_KEY) {
      try {
        // Create or get Stripe customer
        if (!stripeCustomerId) {
          const customer = await stripe.customers.create({
            email: client.email,
            name: client.name,
            metadata: {
              clientId: clientId.toString()
            }
          });
          stripeCustomerId = customer.id;
        }

        // Create checkout session for recurring subscription
        const session = await stripe.checkout.sessions.create({
          customer: stripeCustomerId,
          payment_method_types: ['card'],
          mode: 'subscription',
          line_items: [
            {
              price_data: {
                currency: 'cad',
                product_data: {
                  name: 'Premium Subscription',
                  description: 'Monthly premium subscription - Unlimited provider bookings per month. Automatically renews monthly.'
                },
                unit_amount: subscriptionPrice * 100, // Convert to cents
                recurring: {
                  interval: 'month'
                }
              },
              quantity: 1
            }
          ],
          success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/subscription?subscription=success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/subscription?subscription=cancelled`,
          metadata: {
            clientId: clientId.toString(),
            planType: 'premium'
          },
          subscription_data: {
            metadata: {
              clientId: clientId.toString(),
              planType: 'premium'
            }
          }
        });

        checkoutUrl = session.url;
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        // Continue without Stripe if not configured
      }
    }

    // If Stripe is not configured, activate subscription directly (for testing/development)
    if (!checkoutUrl) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month from now

      // Save customer ID for future Stripe integration
      if (!client.subscription) {
        client.subscription = {};
      }

      client.subscription.planType = 'premium';
      client.subscription.status = 'active';
      client.subscription.startDate = startDate;
      client.subscription.endDate = endDate;
      client.subscription.amount = subscriptionPrice;
      if (stripeCustomerId) {
        client.subscription.stripeCustomerId = stripeCustomerId;
      }

      await client.save();

      return NextResponse.json({
        success: true,
        message: 'Subscription activated',
        subscription: client.subscription
      });
    }

    // Return checkout URL
    return NextResponse.json({
      success: true,
      requiresPayment: true,
      checkoutUrl,
      message: 'Redirect to payment'
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

// Webhook handler for Stripe subscription events
export async function PUT(request) {
  try {
    await connectToDatabase();

    const { subscriptionId, status, endDate } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, message: 'Subscription ID required' },
        { status: 400 }
      );
    }

    // Find client by subscription ID
    const client = await Client.findOne({
      'subscription.stripeSubscriptionId': subscriptionId
    });

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Client not found' },
        { status: 404 }
      );
    }

    // Update subscription status
    if (client.subscription) {
      client.subscription.status = status || client.subscription.status;
      if (endDate) {
        client.subscription.endDate = new Date(endDate);
      }
      await client.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription updated',
      subscription: client.subscription
    });
  } catch (error) {
    console.error('Subscription update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
