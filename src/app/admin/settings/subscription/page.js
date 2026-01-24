'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiLoader, FiDollarSign, FiCheck, FiInfo } from 'react-icons/fi';
import { getAdminToken } from '@/lib/adminAuth';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function SubscriptionPricingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [subscriptionPrice, setSubscriptionPrice] = useState(50);

  useEffect(() => {
    fetchSubscriptionPrice();
  }, []);

  const fetchSubscriptionPrice = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      if (!token) {
        setError('Please login to view settings');
        return;
      }

      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.settings) {
        setSubscriptionPrice(data.settings.clientSubscriptionPrice || 50);
      }
    } catch (err) {
      console.error('Error fetching subscription price:', err);
      setError('Failed to load subscription pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const token = getAdminToken();
      if (!token) {
        setError('Please login to save settings');
        return;
      }

      if (subscriptionPrice < 0) {
        setError('Subscription price cannot be negative');
        setSaving(false);
        return;
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientSubscriptionPrice: parseFloat(subscriptionPrice)
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Subscription pricing updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to save subscription pricing');
      }
    } catch (err) {
      console.error('Error saving subscription pricing:', err);
      setError('Failed to save subscription pricing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FiLoader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const benefits = [
    'Instant access to verified talent ready to work',
    'Priority visibility and faster matches',
    'No long hiring or recruitment process'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Settings</span>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Subscription Pricing</h1>
        <p className="text-gray-600 mt-1">Manage client premium subscription pricing</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Subscription Pricing Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiDollarSign className="w-5 h-5" />
          Premium Subscription Pricing
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Subscription Price (CAD)
            </label>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-700">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={subscriptionPrice}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  if (value >= 0) {
                    setSubscriptionPrice(value);
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-lg font-semibold"
              />
              <span className="text-lg font-medium text-gray-700">/month</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Set the monthly price for client premium subscription. This is mandatory for clients to book talent.
            </p>
          </div>

          {/* Info Box */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-800 font-medium mb-1">About Subscription Pricing</p>
                <p className="text-xs text-blue-700">
                  Clients must subscribe to the premium plan before they can book any talent. 
                  Changing the price will affect new subscriptions only. Existing active subscriptions will continue at their original price until renewal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Subscription Preview</h2>
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 text-white">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Unlock Talent On Demand</h3>
            <div className="flex items-baseline justify-center gap-2 mt-4">
              <span className="text-5xl font-bold">${subscriptionPrice}</span>
              <span className="text-xl text-gray-300">/month</span>
            </div>
            <p className="text-sm text-gray-300 mt-2">Subscription is mandatory to proceed with booking</p>
          </div>

          <div className="space-y-3 mt-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <FiCheck className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-sm text-gray-100 flex-1">{benefit}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <button
              className="w-full px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
              disabled
            >
              Get Premium
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FiSave className="w-4 h-4" />
              Save Subscription Pricing
            </>
          )}
        </button>
      </div>
    </div>
  );
}
