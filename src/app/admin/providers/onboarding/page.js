'use client';

import { useState } from 'react';
import { FiSearch, FiCheck, FiX, FiEye, FiUser } from 'react-icons/fi';

export default function OnboardingPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const onboardingSteps = [
    { step: 'Profile Setup', required: true },
    { step: 'Document Upload', required: true },
    { step: 'Background Check', required: true },
    { step: 'Location Sharing', required: true },
    { step: 'Training Completion', required: false },
  ];

  const providers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      completedSteps: ['Profile Setup', 'Document Upload'],
      currentStep: 'Background Check',
      progress: 40
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Onboarding Management</h1>
        <p className="text-gray-600 mt-1">Track and manage service provider onboarding steps</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 text-center text-gray-500">
          <FiUser className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Onboarding tracking will be displayed here</p>
          <p className="text-sm mt-2">Currently showing {providers.length} provider(s) in onboarding</p>
        </div>
      </div>
    </div>
  );
}

