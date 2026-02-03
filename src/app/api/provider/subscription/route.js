import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Provider from '@/models/Provider';
import AdminSettings from '@/models/AdminSettings';
const jwt = require('jsonwebtoken');
const Stripe = require('stripe');

export async function GET(request) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const providerId = decoded.id;

    const provider = await Provider.findById(providerId);
    if (!provider) {
      return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 });
    }

    const now = new Date();
    const isActive =
      provider.subscription?.status === 'active' &&
      provider.subscription?.planType === 'premium' &&
      (!provider.subscription?.endDate || new Date(provider.subscription.endDate) > now) &&
      (!provider.subscription?.startDate || new Date(provider.subscription.startDate) <= now);

    const adminSettings = await AdminSettings.getSettings();
    const price = adminSettings.providerSubscriptionPrice ?? 29;

    return NextResponse.json({
      success: true,
      subscription: provider.subscription || null,
      isActive,
      price
    });
  } catch (error) {
    console.error('Provider subscription status error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const providerId = decoded.id;

    const provider = await Provider.findById(providerId);
    if (!provider) {
      return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 });
    }

    const now = new Date();
    const hasActiveSubscription =
      provider.subscription?.status === 'active' &&
      provider.subscription?.planType === 'premium' &&
      (!provider.subscription?.endDate || new Date(provider.subscription.endDate) > now) &&
      (!provider.subscription?.startDate || new Date(provider.subscription.startDate) <= now);

    if (hasActiveSubscription) {
      return NextResponse.json({
        success: true,
        message: 'Subscription already active',
        subscription: provider.subscription
      });
    }

    const adminSettings = await AdminSettings.getSettings();
    const subscriptionPrice = adminSettings.providerSubscriptionPrice ?? 29;

    const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || 'sk_test_51MAu7gI7BEvOC2zJTYQxB3JsfS5rINOJylLzJuhWTG3p4WAvTRQ1us6Fof8Z2UZEi15rxmAyXTbNnny1stNz4d7200w9BfzrOR').trim();
    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file. Restart the server after adding it.'
        },
        { status: 400 }
      );
    }

    let baseUrl = (process.env.NEXT_PUBLIC_APP_URL || '').trim();
    if (!baseUrl && typeof request.url === 'string') {
      try {
        baseUrl = new URL(request.url).origin;
      } catch (_) {}
    }
    baseUrl = baseUrl || 'http://localhost:3000';

    let stripeCustomerId = provider.subscription?.stripeCustomerId;

    try {
      const stripeInstance = new Stripe(stripeSecretKey);

      if (!stripeCustomerId) {
        const customer = await stripeInstance.customers.create({
          email: provider.email,
          name: provider.name,
          metadata: {
            providerId: providerId.toString()
          }
        });
        stripeCustomerId = customer.id;
      }

      const session = await stripeInstance.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price_data: {
              currency: 'cad',
              product_data: {
                name: 'Worker Subscription',
                description:
                  'Monthly subscription - Unlock the job feed and start finding work near you. Automatically renews monthly.'
              },
              unit_amount: Math.round(subscriptionPrice * 100),
              recurring: {
                interval: 'month'
              }
            },
            quantity: 1
          }
        ],
        success_url: `${baseUrl}/provider?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/provider/subscription?subscription=cancelled`,
        metadata: {
          providerId: providerId.toString(),
          planType: 'premium',
          role: 'provider'
        },
        subscription_data: {
          metadata: {
            providerId: providerId.toString(),
            planType: 'premium',
            role: 'provider'
          }
        }
      });

      const checkoutUrl = session.url;
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
        message:
          'Redirect to Stripe to complete payment. Subscription will be activated only after payment succeeds.'
      });
    } catch (stripeError) {
      console.error('Stripe checkout error (provider):', stripeError);
      return NextResponse.json(
        {
          success: false,
          message:
            stripeError?.message || 'Could not start payment. Check STRIPE_SECRET_KEY and try again.'
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Provider subscription creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
