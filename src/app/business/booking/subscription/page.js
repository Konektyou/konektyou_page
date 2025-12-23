'use client';

import { FiCheckCircle, FiXCircle, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { useState } from 'react';
import Link from 'next/link';

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const plans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 299,
      period: 'monthly',
      shifts: 10,
      features: [
        '10 shifts per month',
        'Access to all providers',
        'Standard support',
        'Basic reporting'
      ]
    },
    {
      id: 'professional',
      name: 'Professional Plan',
      price: 599,
      period: 'monthly',
      shifts: 30,
      features: [
        '30 shifts per month',
        'Access to all providers',
        'Priority support',
        'Advanced reporting',
        'Dedicated account manager'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 999,
      period: 'monthly',
      shifts: 'Unlimited',
      features: [
        'Unlimited shifts',
        'Access to all providers',
        '24/7 priority support',
        'Custom reporting',
        'Dedicated account manager',
        'Custom integrations'
      ]
    },
  ];

  const handleSubscribe = (planId) => {
    setSelectedPlan(planId);
    // Handle subscription logic here
    console.log('Subscribing to plan:', planId);
    setIsSubscribed(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-gray-600 mt-1">Choose a subscription plan to start booking service providers</p>
      </div>

      {!isSubscribed ? (
        <>
          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-sm border-2 p-6 relative ${
                  plan.popular
                    ? 'border-black'
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-black text-white px-4 py-1 text-xs font-medium rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {typeof plan.shifts === 'number' ? `${plan.shifts} shifts` : plan.shifts} per month
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Subscribe Now
                </button>
              </div>
            ))}
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-blue-900 mb-2">Subscription Information</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Subscriptions are billed monthly and can be cancelled anytime</li>
              <li>• Unused shifts do not roll over to the next month</li>
              <li>• You can upgrade or downgrade your plan at any time</li>
              <li>• All plans include access to verified service providers</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FiCheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Active!</h2>
          <p className="text-gray-600 mb-6">
            Your subscription has been activated. You can now start booking service providers.
          </p>
          <Link
            href="/business/booking/catalog"
            className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Browse Providers
          </Link>
        </div>
      )}
    </div>
  );
}

