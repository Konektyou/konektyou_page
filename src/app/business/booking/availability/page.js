'use client';

import { FiMap, FiClock, FiCheckCircle, FiXCircle, FiUser } from 'react-icons/fi';
import { useState } from 'react';

export default function TrackAvailability() {
  const [selectedProvider, setSelectedProvider] = useState(null);

  const providers = [
    {
      id: 1,
      name: 'John Smith',
      service: 'PSW',
      available: true,
      nextAvailable: 'Today, 2:00 PM',
      currentLocation: 'Downtown Toronto',
      status: 'Available Now'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      service: 'Office Support',
      available: true,
      nextAvailable: 'Today, 1:00 PM',
      currentLocation: 'North York',
      status: 'Available Now'
    },
    {
      id: 3,
      name: 'Michael Brown',
      service: 'Cleaning',
      available: false,
      nextAvailable: 'Tomorrow, 9:00 AM',
      currentLocation: 'Scarborough',
      status: 'On Assignment'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Track Provider Availability</h1>
        <p className="text-gray-600 mt-1">View real-time availability of service providers</p>
      </div>

      {/* Providers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className={`bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer transition-all ${
              selectedProvider === provider.id
                ? 'border-black'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedProvider(provider.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                  <FiUser className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{provider.name}</h3>
                  <p className="text-sm text-gray-600">{provider.service}</p>
                </div>
              </div>
              {provider.available ? (
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <FiXCircle className="w-6 h-6 text-gray-400" />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  provider.available
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {provider.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiMap className="w-4 h-4" />
                <span>{provider.currentLocation}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiClock className="w-4 h-4" />
                <span>Next Available: {provider.nextAvailable}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Map View Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Provider Locations Map</h2>
        <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <FiMap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Map View</p>
            <p className="text-sm text-gray-500 mt-1">
              Real-time location tracking of available providers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

