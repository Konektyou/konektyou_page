import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Client from '@/models/Client';
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, message: 'No signature' },
        { status: 400 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { success: false, message: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
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

// Handle checkout session completed (initial subscription)
async function handleCheckoutSessionCompleted(session) {
  try {
    const clientId = session.metadata?.clientId;
    if (!clientId) {
      console.error('No clientId in session metadata');
      return;
    }

    const client = await Client.findById(clientId);
    if (!client) {
      console.error('Client not found:', clientId);
      return;
    }

    // Get subscription from Stripe
    const subscriptionId = session.subscription;
    if (!subscriptionId) {
      console.error('No subscription ID in session');
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const startDate = new Date(subscription.current_period_start * 1000);
    const endDate = new Date(subscription.current_period_end * 1000); // This is 30 days from start

    // Update client subscription with proper dates
    if (!client.subscription) {
      client.subscription = {};
    }

    client.subscription.planType = 'premium';
    client.subscription.status = subscription.status === 'active' ? 'active' : 'inactive';
    client.subscription.startDate = startDate;
    client.subscription.endDate = endDate; // 30 days from start
    client.subscription.amount = subscription.items.data[0]?.price?.unit_amount / 100 || 50;
    client.subscription.stripeSubscriptionId = subscriptionId;
    client.subscription.stripeCustomerId = subscription.customer;

    await client.save();
    console.log('Subscription activated for client:', clientId, 'Start:', startDate, 'End:', endDate);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

// Handle subscription updated (renewals, status changes)
async function handleSubscriptionUpdated(subscription) {
  try {
    const client = await Client.findOne({
      'subscription.stripeSubscriptionId': subscription.id
    });

    if (!client) {
      console.error('Client not found for subscription:', subscription.id);
      return;
    }

    const startDate = new Date(subscription.current_period_start * 1000);
    const endDate = new Date(subscription.current_period_end * 1000);

    // Update subscription status
    let status = 'inactive';
    if (subscription.status === 'active') {
      status = 'active';
    } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      status = 'cancelled';
    } else if (subscription.status === 'past_due') {
      status = 'expired';
    }

    client.subscription.status = status;
    client.subscription.startDate = startDate;
    client.subscription.endDate = endDate;
    client.subscription.amount = subscription.items.data[0]?.price?.unit_amount / 100 || client.subscription.amount || 50;

    await client.save();
    console.log('Subscription updated for client:', client._id);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription) {
  try {
    const client = await Client.findOne({
      'subscription.stripeSubscriptionId': subscription.id
    });

    if (!client) {
      console.error('Client not found for subscription:', subscription.id);
      return;
    }

    client.subscription.status = 'cancelled';
    await client.save();
    console.log('Subscription cancelled for client:', client._id);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

// Handle successful invoice payment (monthly renewal)
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) {
      return;
    }

    const client = await Client.findOne({
      'subscription.stripeSubscriptionId': subscriptionId
    });

    if (!client) {
      console.error('Client not found for subscription:', subscriptionId);
      return;
    }

    // Get updated subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const startDate = new Date(subscription.current_period_start * 1000);
    const endDate = new Date(subscription.current_period_end * 1000); // New 30-day period

    // Update subscription dates for new billing period (automatic renewal after 30 days)
    if (!client.subscription) {
      client.subscription = {};
    }

    client.subscription.status = 'active';
    client.subscription.startDate = startDate;
    client.subscription.endDate = endDate; // Next 30 days
    client.subscription.amount = subscription.items.data[0]?.price?.unit_amount / 100 || client.subscription.amount || 50;

    await client.save();
    console.log('Subscription renewed for client:', client._id, 'New period:', startDate, 'to', endDate);
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) {
      return;
    }

    const client = await Client.findOne({
      'subscription.stripeSubscriptionId': subscriptionId
    });

    if (!client) {
      return;
    }

    // Mark subscription as expired if payment fails
    client.subscription.status = 'expired';
    await client.save();
    console.log('Subscription payment failed for client:', client._id);
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}
