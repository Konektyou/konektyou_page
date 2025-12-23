'use client';

import Link from 'next/link';
import { FiCheckCircle, FiCreditCard, FiClock, FiBriefcase } from 'react-icons/fi';

export default function BusinessControlsPage() {
  const controlTypes = [
    {
      title: 'Verifications',
      description: 'Approve business verification requests',
      icon: FiCheckCircle,
      href: '/admin/businesses/verifications',
      count: 12
    },
    {
      title: 'Subscriptions',
      description: 'Manage business subscription plans',
      icon: FiCreditCard,
      href: '/admin/businesses/subscriptions',
      count: 89
    },
    {
      title: 'Booking History',
      description: 'View business booking history and analytics',
      icon: FiClock,
      href: '/admin/businesses/history',
      count: 1245
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Business Controls</h1>
        <p className="text-gray-600 mt-1">Manage business verifications, subscriptions, and booking access</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {controlTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Link
              key={type.href}
              href={type.href}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <Icon className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{type.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{type.description}</p>
              <p className="text-2xl font-bold text-gray-900">{type.count.toLocaleString()}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

