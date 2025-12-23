'use client';

import Link from 'next/link';
import { FiFile, FiUserCheck, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';

export default function ServiceProviderControlsPage() {
  const controlTypes = [
    {
      title: 'Document Verification',
      description: 'Verify provider documents and certifications',
      icon: FiFile,
      href: '/admin/providers/documents',
      count: 15
    },
    {
      title: 'Onboarding',
      description: 'Track and manage onboarding steps',
      icon: FiUserCheck,
      href: '/admin/providers/onboarding',
      count: 8
    },
    {
      title: 'Performance',
      description: 'Monitor provider performance metrics',
      icon: FiTrendingUp,
      href: '/admin/providers/performance',
      count: 234
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Provider Controls</h1>
        <p className="text-gray-600 mt-1">Manage service provider verification, onboarding, and performance</p>
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

