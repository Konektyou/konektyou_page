import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Provider from '@/models/Provider';
const jwt = require('jsonwebtoken');
const Stripe = require('stripe');

/**
 * Sync provider subscription from Stripe checkout session.
 * Call this when user returns from Stripe success URL with session_id
 * so the DB is updated even if the webhook hasn't fired yet (e.g. local dev).
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'session_id required' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const providerId = decoded.id;

    const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || '').trim();
    if (!stripeSecretKey) {
      return NextResponse.json(
        { success: false, message: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });

    if (session.payment_status !== 'paid' || session.mode !== 'subscription') {
      return NextResponse.json(
        { success: false, message: 'Session not paid or not a subscription' },
        { status: 400 }
      );
    }

    const metadataProviderId = session.metadata?.providerId;
    if (!metadataProviderId || metadataProviderId !== providerId.toString()) {
      return NextResponse.json(
        { success: false, message: 'Session does not belong to this provider' },
        { status: 403 }
      );
    }

    const rawSub = session.subscription;
    const subscriptionId = typeof rawSub === 'string' ? rawSub : (rawSub?.id || rawSub);
    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, message: 'No subscription in session' },
        { status: 400 }
      );
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const startDate = new Date(stripeSubscription.current_period_start * 1000);
    const endDate = new Date(stripeSubscription.current_period_end * 1000);
    const amount = stripeSubscription.items?.data?.[0]?.price?.unit_amount != null
      ? stripeSubscription.items.data[0].price.unit_amount / 100
      : 29;
    const stripeCustomerId = typeof stripeSubscription.customer === 'string'
      ? stripeSubscription.customer
      : stripeSubscription.customer?.id;

    const subscriptionUpdate = {
      planType: 'premium',
      status: stripeSubscription.status === 'active' ? 'active' : 'inactive',
      startDate,
      endDate,
      amount,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: stripeCustomerId || ''
    };

    await connectToDatabase();
    const provider = await Provider.findByIdAndUpdate(
      providerId,
      { $set: { subscription: subscriptionUpdate, updatedAt: new Date() } },
      { new: true }
    );

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription synced',
      subscription: provider.subscription
    });
  } catch (error) {
    console.error('Provider subscription sync error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to sync subscription' },
      { status: 500 }
    );
  }
}
