'use client';

import { useState } from 'react';
import { FiSearch, FiCreditCard, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function BusinessSubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const subscriptions = [
    {
      id: 1,
      businessName: 'ABC Healthcare',
      plan: 'Premium',
      status: 'active',
      nextBilling: '2024-02-01',
      amount: 199
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Business Subscriptions</h1>
        <p className="text-gray-600 mt-1">Manage business subscription plans and billing</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 text-center text-gray-500">
          <FiCreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Business subscriptions will be displayed here</p>
          <p className="text-sm mt-2">Currently managing {subscriptions.length} active subscription(s)</p>
        </div>
      </div>
    </div>
  );
}

