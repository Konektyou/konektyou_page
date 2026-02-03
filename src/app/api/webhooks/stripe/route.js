import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Client from '@/models/Client';
import Provider from '@/models/Provider';
import mongoose from 'mongoose';
const Stripe = require('stripe');

const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || '').trim();
const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();

export async function POST(request) {
  try {
    if (!stripeSecretKey) {
      console.error('Stripe webhook: STRIPE_SECRET_KEY is not set');
      return NextResponse.json(
        { success: false, message: 'Stripe not configured' },
        { status: 500 }
      );
    }
    if (!webhookSecret) {
      console.error('Stripe webhook: STRIPE_WEBHOOK_SECRET is not set. For local testing run: stripe listen --forward-to localhost:3000/api/webhooks/stripe');
      return NextResponse.json(
        { success: false, message: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    await connectToDatabase();

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, message: 'No signature' },
        { status: 400 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message, '– Set STRIPE_WEBHOOK_SECRET in .env. For local dev use: stripe listen --forward-to localhost:3000/api/webhooks/stripe');
      return NextResponse.json(
        { success: false, message: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object, stripe);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, stripe);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object, stripe);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, message: 'Webhook error', error: error.message },
      { status: 500 }
    );
  }
}

// Handle checkout session completed (initial subscription payment succeeded)
async function handleCheckoutSessionCompleted(session, stripe) {
  try {
    const rawSub = session.subscription;
    const subscriptionId = typeof rawSub === 'string' ? rawSub : (rawSub?.id || rawSub);
    if (!subscriptionId) {
      console.error('Stripe webhook: No subscription ID in checkout session', session.id);
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const startDate = new Date(subscription.current_period_start * 1000);
    const endDate = new Date(subscription.current_period_end * 1000);
    const amount = subscription.items?.data?.[0]?.price?.unit_amount != null
      ? subscription.items.data[0].price.unit_amount / 100
      : 50;
    const stripeCustomerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

    const subscriptionUpdate = {
      planType: 'premium',
      status: subscription.status === 'active' ? 'active' : 'inactive',
      startDate,
      endDate,
      amount,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: stripeCustomerId || ''
    };

    const clientId = session.metadata?.clientId;
    const providerId = session.metadata?.providerId;

    if (clientId) {
      const conn = await connectToDatabase();
      const db = conn.connection.db;
      const clientsCollection = db.collection('clients');
      const clientObjectId = mongoose.Types.ObjectId(clientId);
      const updateResult = await clientsCollection.updateOne(
        { _id: clientObjectId },
        { $set: { subscription: subscriptionUpdate, updatedAt: new Date() } }
      );
      if (updateResult.matchedCount === 0) {
        console.error('Stripe webhook: Client not found for id', clientId);
        return;
      }
      console.log('Subscription activated for client:', clientId, 'Start:', startDate, 'End:', endDate);
      return;
    }

    if (providerId) {
      const conn = await connectToDatabase();
      const db = conn.connection.db;
      const providersCollection = db.collection('providers');
      const providerObjectId = mongoose.Types.ObjectId(providerId);
      const updateResult = await providersCollection.updateOne(
        { _id: providerObjectId },
        { $set: { subscription: subscriptionUpdate, updatedAt: new Date() } }
      );
      if (updateResult.matchedCount === 0) {
        console.error('Stripe webhook: Provider not found for id', providerId);
        return;
      }
      console.log('Subscription activated for provider:', providerId, 'Start:', startDate, 'End:', endDate);
      return;
    }

    console.error('Stripe webhook: No clientId or providerId in session metadata', session.id);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
}

// Handle subscription updated (renewals, status changes)
async function handleSubscriptionUpdated(subscription, stripe) {
  try {
    const startDate = new Date(subscription.current_period_start * 1000);
    const endDate = new Date(subscription.current_period_end * 1000);
    let status = 'inactive';
    if (subscription.status === 'active') {
      status = 'active';
    } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      status = 'cancelled';
    } else if (subscription.status === 'past_due') {
      status = 'expired';
    }
    const amount = subscription.items?.data?.[0]?.price?.unit_amount != null
      ? subscription.items.data[0].price.unit_amount / 100
      : null;

    const client = await Client.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
    if (client) {
      client.subscription.status = status;
      client.subscription.startDate = startDate;
      client.subscription.endDate = endDate;
      if (amount != null) client.subscription.amount = amount;
      await client.save();
      console.log('Subscription updated for client:', client._id);
      return;
    }

    const provider = await Provider.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
    if (provider) {
      if (!provider.subscription) provider.subscription = {};
      provider.subscription.status = status;
      provider.subscription.startDate = startDate;
      provider.subscription.endDate = endDate;
      if (amount != null) provider.subscription.amount = amount;
      await provider.save();
      console.log('Subscription updated for provider:', provider._id);
      return;
    }

    console.error('Client/Provider not found for subscription:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription) {
  try {
    const client = await Client.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
    if (client) {
      client.subscription.status = 'cancelled';
      await client.save();
      console.log('Subscription cancelled for client:', client._id);
      return;
    }
    const provider = await Provider.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
    if (provider) {
      if (provider.subscription) provider.subscription.status = 'cancelled';
      await provider.save();
      console.log('Subscription cancelled for provider:', provider._id);
      return;
    }
    console.error('Client/Provider not found for subscription:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

// Handle successful invoice payment (monthly renewal)
async function handleInvoicePaymentSucceeded(invoice, stripe) {
  try {
    const subscriptionId = typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id;
    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const startDate = new Date(subscription.current_period_start * 1000);
    const endDate = new Date(subscription.current_period_end * 1000);
    const amount = subscription.items?.data?.[0]?.price?.unit_amount != null
      ? subscription.items.data[0].price.unit_amount / 100
      : null;

    const client = await Client.findOne({ 'subscription.stripeSubscriptionId': subscriptionId });
    if (client) {
      if (!client.subscription) client.subscription = {};
      client.subscription.status = 'active';
      client.subscription.startDate = startDate;
      client.subscription.endDate = endDate;
      if (amount != null) client.subscription.amount = amount;
      await client.save();
      console.log('Subscription renewed for client:', client._id, 'New period:', startDate, 'to', endDate);
      return;
    }

    const provider = await Provider.findOne({ 'subscription.stripeSubscriptionId': subscriptionId });
    if (provider) {
      if (!provider.subscription) provider.subscription = {};
      provider.subscription.status = 'active';
      provider.subscription.startDate = startDate;
      provider.subscription.endDate = endDate;
      if (amount != null) provider.subscription.amount = amount;
      await provider.save();
      console.log('Subscription renewed for provider:', provider._id, 'New period:', startDate, 'to', endDate);
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice) {
  try {
    const subscriptionId = typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id;
    if (!subscriptionId) return;

    const client = await Client.findOne({ 'subscription.stripeSubscriptionId': subscriptionId });
    if (client) {
      client.subscription.status = 'expired';
      await client.save();
      console.log('Subscription payment failed for client:', client._id);
      return;
    }
    const provider = await Provider.findOne({ 'subscription.stripeSubscriptionId': subscriptionId });
    if (provider) {
      if (provider.subscription) provider.subscription.status = 'expired';
      await provider.save();
      console.log('Subscription payment failed for provider:', provider._id);
    }
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}
