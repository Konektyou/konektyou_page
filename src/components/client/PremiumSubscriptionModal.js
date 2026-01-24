'use client';

import { useState, useEffect } from 'react';
import { FiX, FiCheck, FiLoader } from 'react-icons/fi';
import { getClientToken } from '@/lib/clientAuth';
import { useRouter } from 'next/navigation';

export default function PremiumSubscriptionModal({ isOpen, onClose, onSubscribeSuccess }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subscriptionPrice, setSubscriptionPrice] = useState(50);

  useEffect(() => {
    if (isOpen) {
      fetchSubscriptionPrice();
    }
  }, [isOpen]);

  const fetchSubscriptionPrice = async () => {
    try {
      const response = await fetch('/api/public/subscription-price');
      const data = await response.json();
      if (data.success) {
        setSubscriptionPrice(data.price || 50);
      }
    } catch (err) {
      console.error('Error fetching subscription price:', err);
      // Keep default price of 50
    }
  };

  const handleSubscribe = async () => {
    // Close modal and redirect to subscription page
    onClose();
    router.push('/client/subscription');
  };

  if (!isOpen) return null;

  const benefits = [
    'Instant access to verified talent ready to work',
    'Priority visibility and faster matches',
    'No long hiring or recruitment process'
  ];

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[10002] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Unlock Talent On Demand</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Price */}
          <div className="text-center mb-6">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl font-bold text-gray-900">${subscriptionPrice}</span>
              <span className="text-lg text-gray-600">/month</span>
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

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubscribe}
              className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Get Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
