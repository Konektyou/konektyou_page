# Stripe Webhook Setup for Subscription Management

## Overview
This application uses Stripe webhooks to handle recurring subscription payments and subscription lifecycle events.

## Webhook Endpoint
**URL:** `https://yourdomain.com/api/webhooks/stripe`

## Required Environment Variables
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Get this from Stripe Dashboard
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Setting Up Webhook in Stripe Dashboard

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select the following events to listen to:
   - `checkout.session.completed` - When initial subscription payment succeeds
   - `customer.subscription.created` - When subscription is created
   - `customer.subscription.updated` - When subscription is updated/renewed
   - `customer.subscription.deleted` - When subscription is cancelled
   - `invoice.payment_succeeded` - When monthly payment succeeds (renewal)
   - `invoice.payment_failed` - When monthly payment fails

5. Copy the "Signing secret" and add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

## How It Works

### Initial Subscription
1. Client clicks "Get Premium" → Redirected to Stripe Checkout
2. After payment → `checkout.session.completed` event fires
3. Webhook activates subscription in database with start/end dates

### Monthly Renewal
1. Stripe automatically charges client each month
2. `invoice.payment_succeeded` event fires
3. Webhook updates subscription end date for new billing period
4. Client can continue booking without interruption

### Payment Failure
1. If payment fails → `invoice.payment_failed` event fires
2. Webhook marks subscription as 'expired'
3. Client must resubscribe to continue booking

## Testing Webhooks Locally

Use Stripe CLI to forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will give you a webhook signing secret for local testing.

## Subscription Flow

1. **User logs in** → Sees available talent
2. **Clicks "Book Now"** → Subscription check
3. **No subscription?** → Premium pop-up appears
4. **Clicks "Get Premium"** → Redirected to Stripe Checkout
5. **Payment succeeds** → Subscription activated
6. **Can book unlimited providers** in the same month
7. **Next month** → Automatic renewal via Stripe
8. **If payment fails** → Subscription expires, must resubscribe
