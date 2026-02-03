'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiLoader, FiCheck, FiArrowLeft, FiCreditCard } from 'react-icons/fi';
import { getProviderToken, isProviderAuthenticated, clearProviderAuth } from '@/lib/providerAuth';
import Link from 'next/link';

const PROVIDER_LOGIN_URL = '/login?role=provider';

export default function ProviderSubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscriptionPrice, setSubscriptionPrice] = useState(29);
  const [isActive, setIsActive] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [router]);

  const fetchSubscriptionStatus = async () => {
    try {
      if (!isProviderAuthenticated()) {
        clearProviderAuth();
        router.replace(PROVIDER_LOGIN_URL);
        setLoading(false);
        return;
      }
      const token = getProviderToken();
      const response = await fetch('/api/provider/subscription', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setIsActive(data.isActive);
        if (data.price != null) setSubscriptionPrice(data.price);
      } else if (response.status === 401 || response.status === 404 || data.message === 'Provider not found' || data.message === 'Unauthorized') {
        clearProviderAuth();
        router.replace(PROVIDER_LOGIN_URL);
      }
    } catch (err) {
      console.error('Error fetching subscription status:', err);
    } finally {
      setLoading(false);
    }
  };

  const initializeSubscription = async () => {
    try {
      setProcessing(true);
      setError('');

      if (!isProviderAuthenticated()) {
        clearProviderAuth();
        router.replace(PROVIDER_LOGIN_URL);
        setProcessing(false);
        return;
      }

      const token = getProviderToken();
      const response = await fetch('/api/provider/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        if (data.requiresPayment && data.checkoutUrl) {
          setCheckoutUrl(data.checkoutUrl);
          window.location.href = data.checkoutUrl;
        } else if (data.subscription || data.isActive) {
          router.push('/provider');
        } else {
          setError(data.message || 'Failed to start subscription');
          setProcessing(false);
        }
      } else {
        if (response.status === 401 || response.status === 404 || data.message === 'Provider not found' || data.message === 'Unauthorized') {
          clearProviderAuth();
          router.replace(PROVIDER_LOGIN_URL);
        } else {
          setError(data.message || 'Failed to initialize subscription');
          setProcessing(false);
        }
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

  useEffect(() => {
    const subscriptionStatus = searchParams?.get('subscription');
    if (subscriptionStatus === 'success') {
      setTimeout(() => router.push('/provider'), 2000);
    } else if (subscriptionStatus === 'cancelled') {
      setError('Subscription was cancelled. Please try again if you want to subscribe.');
      setLoading(false);
    }
  }, [searchParams, router]);

  const benefits = [
    'Unlock the full job feed and see opportunities near you',
    'Apply to live jobs and get hired faster',
    'Distance tags and employer details on every listing',
    'Subscription renews monthly so you keep access'
  ];

  if (searchParams?.get('subscription') === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re all set!</h2>
          <p className="text-gray-600 mb-6">
            Your subscription is active. You can now access the job feed and start finding work.
          </p>
          <p className="text-sm text-gray-500 mb-6">Redirecting to dashboard...</p>
          <Link
            href="/provider"
            className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You already have an active subscription</h2>
          <p className="text-gray-600 mb-6">You have full access to the job feed.</p>
          <Link
            href="/provider"
            className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
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
          <FiLoader className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Setting up payment...</h2>
          <p className="text-gray-600">
            {checkoutUrl ? 'Redirecting to secure payment page...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/provider"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Subscribe to start finding work</h1>
          <p className="text-gray-600 mt-1">Unlock the job feed and apply to opportunities near you</p>
        </div>

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
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Unlock the job feed</h2>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-gray-900">${subscriptionPrice}</span>
                    <span className="text-xl text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Subscribe to see and apply to jobs near you</p>
                  <p className="text-xs text-gray-400 mt-1">
                    You will be taken to Stripe to pay. Access is activated after payment succeeds.
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        <FiCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="text-sm text-gray-700 flex-1">{benefit}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <FiCreditCard className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-emerald-800 font-medium mb-1">Secure payment</p>
                      <p className="text-xs text-emerald-700">
                        You will be redirected to Stripe to enter your card. Your subscription renews every 30 days.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={initializeSubscription}
                  disabled={processing}
                  className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Redirecting to payment...
                    </>
                  ) : (
                    <>
                      <FiCreditCard className="w-4 h-4" />
                      Subscribe to unlock — ${subscriptionPrice}/month
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription terms</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Subscription automatically renews every 30 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>You can cancel anytime from your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Full access to the job feed while subscribed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Payment is processed securely through Stripe</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Plan</span>
                  <span className="text-sm font-medium text-gray-900">Worker monthly</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Billing cycle</span>
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
