import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Client from '@/models/Client';
import AdminSettings from '@/models/AdminSettings';
const jwt = require('jsonwebtoken');
const Stripe = require('stripe');

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

    const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || 'sk_test_51MAu7gI7BEvOC2zJTYQxB3JsfS5rINOJylLzJuhWTG3p4WAvTRQ1us6Fof8Z2UZEi15rxmAyXTbNnny1stNz4d7200w9BfzrOR').trim();
    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file (get your key from https://dashboard.stripe.com/apikeys). Restart the server after adding it.'
        },
        { status: 400 }
      );
    }

    // Base URL for Stripe redirects (success/cancel)
    let baseUrl = (process.env.NEXT_PUBLIC_APP_URL || '').trim();
    if (!baseUrl && typeof request.url === 'string') {
      try {
        baseUrl = new URL(request.url).origin;
      } catch (_) {}
    }
    baseUrl = baseUrl || 'http://localhost:3000';

    let checkoutUrl = null;
    let stripeCustomerId = client.subscription?.stripeCustomerId;

    try {
      const stripeInstance = new Stripe(stripeSecretKey);

      // Create or get Stripe customer
      if (!stripeCustomerId) {
        const customer = await stripeInstance.customers.create({
          email: client.email,
          name: client.name,
          metadata: {
            clientId: clientId.toString()
          }
        });
        stripeCustomerId = customer.id;
      }

      // Create checkout session – user is redirected to Stripe to pay; subscription is set to premium only after webhook (checkout.session.completed)
      const session = await stripeInstance.checkout.sessions.create({
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
              unit_amount: Math.round(subscriptionPrice * 100), // cents
              recurring: {
                interval: 'month'
              }
            },
            quantity: 1
          }
        ],
        success_url: `${baseUrl}/client/subscription?subscription=success`,
        cancel_url: `${baseUrl}/client/subscription?subscription=cancelled`,
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
      console.error('Stripe checkout error:', stripeError);
      return NextResponse.json(
        {
          success: false,
          message: stripeError?.message || 'Could not start payment. Check STRIPE_SECRET_KEY and try again.'
        },
        { status: 400 }
      );
    }

    if (!checkoutUrl) {
      return NextResponse.json(
        { success: false, message: 'Could not create payment link. Please try again.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      requiresPayment: true,
      checkoutUrl,
      message: 'Redirect to Stripe to complete payment. Subscription will be activated only after payment succeeds.'
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
