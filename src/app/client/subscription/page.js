'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiLoader, FiCheck, FiArrowLeft, FiCreditCard } from 'react-icons/fi';
import { getClientToken } from '@/lib/clientAuth';
import Link from 'next/link';

export default function SubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscriptionPrice, setSubscriptionPrice] = useState(50);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Only fetch price on load, don't create checkout
    fetchSubscriptionPrice();
  }, []);

  const fetchSubscriptionPrice = async () => {
    try {
      const priceResponse = await fetch('/api/public/subscription-price');
      const priceData = await priceResponse.json();
      if (priceData.success) {
        setSubscriptionPrice(priceData.price || 50);
      }
    } catch (err) {
      console.error('Error fetching subscription price:', err);
    } finally {
      setLoading(false);
    }
  };

  const initializeSubscription = async () => {
    try {
      setProcessing(true);
      setError('');

      // Create Stripe checkout session
      const token = getClientToken();
      if (!token) {
        setError('Please login to subscribe');
        setProcessing(false);
        return;
      }

      const response = await fetch('/api/client/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planType: 'premium'
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.requiresPayment && data.checkoutUrl) {
          // Redirect to Stripe Checkout page
          setCheckoutUrl(data.checkoutUrl);
          window.location.href = data.checkoutUrl;
        } else if (data.subscription) {
          // Already subscribed, redirect back
          router.push('/client?subscription=success');
        }
      } else {
        setError(data.message || 'Failed to initialize subscription');
        setProcessing(false);
      }
    } catch (err) {
      console.error('Subscription initialization error:', err);
      setError('An error occurred. Please try again.');
      setProcessing(false);
    }
  };

  const handleRetry = () => {
    setError('');
    setProcessing(false);
  };

  // Check if returning from Stripe
  useEffect(() => {
    const subscriptionStatus = searchParams?.get('subscription');
    if (subscriptionStatus === 'success') {
      // Successfully subscribed, redirect to dashboard
      setTimeout(() => {
        router.push('/client');
      }, 2000);
    } else if (subscriptionStatus === 'cancelled') {
      setError('Subscription was cancelled. Please try again if you want to subscribe.');
      setLoading(false);
    }
  }, [searchParams, router]);

  const benefits = [
    'Instant access to verified talent ready to work',
    'Priority visibility and faster matches',
    'No long hiring or recruitment process',
    'Unlimited bookings per month once subscribed'
  ];

  if (searchParams?.get('subscription') === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Activated!</h2>
          <p className="text-gray-600 mb-6">
            Your premium subscription has been activated successfully. You can now book providers.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Redirecting to dashboard...
          </p>
          <Link
            href="/client"
            className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading || checkoutUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <FiLoader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Setting up payment...</h2>
          <p className="text-gray-600">
            {checkoutUrl ? 'Redirecting to secure payment page...' : 'Preparing your subscription...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/client"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Premium Subscription</h1>
          <p className="text-gray-600 mt-1">Subscribe to unlock unlimited provider bookings</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <p className="text-red-800 flex-1">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Subscription Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subscription Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Unlock Talent On Demand</h2>
              </div>
              <div className="p-6">
                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-gray-900">${subscriptionPrice}</span>
                    <span className="text-xl text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Subscription is mandatory to proceed with booking</p>
                  <p className="text-xs text-gray-400 mt-1">Unlimited bookings per month once subscribed</p>
                </div>

                {/* Benefits */}
                <div className="space-y-3 mb-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <FiCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-700 flex-1">{benefit}</p>
                    </div>
                  ))}
                </div>

                {/* Payment Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <FiCreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 font-medium mb-1">Secure Payment</p>
                      <p className="text-xs text-blue-700">
                        You will be redirected to Stripe's secure payment page to enter your card details. 
                        Your subscription will automatically renew every 30 days.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subscribe Button */}
                <button
                  onClick={initializeSubscription}
                  disabled={processing}
                  className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Redirecting to Payment...
                    </>
                  ) : (
                    <>
                      <FiCreditCard className="w-4 h-4" />
                      Get Premium - ${subscriptionPrice}/month
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Subscription Terms */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Terms</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Subscription automatically renews every 30 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>You can cancel your subscription at any time from your account settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Unlimited provider bookings during your active subscription period</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Payment is processed securely through Stripe</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Side - Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Plan</span>
                  <span className="text-sm font-medium text-gray-900">Premium Monthly</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Billing Cycle</span>
                  <span className="text-sm font-medium text-gray-900">Monthly</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">${subscriptionPrice}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">per month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
