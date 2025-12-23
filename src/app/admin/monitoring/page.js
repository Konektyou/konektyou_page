'use client';

import { useState } from 'react';
import { FiMap, FiFilter, FiRefreshCw, FiUser, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

export default function RealTimeMonitoringPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const providers = [
    { id: 1, name: 'John Doe', category: 'PSW', status: 'available', location: [43.6532, -79.3832] },
    { id: 2, name: 'Jane Smith', category: 'Office Support', status: 'busy', location: [43.6426, -79.3871] },
    { id: 3, name: 'Mike Johnson', category: 'PSW', status: 'available', location: [43.6670, -79.4000] },
    { id: 4, name: 'Sarah Williams', category: 'Office Support', status: 'offline', location: [43.6300, -79.4200] },
  ];

  const filteredProviders = selectedCategory === 'all' 
    ? providers 
    : providers.filter(p => p.category === selectedCategory);

  const statusCounts = {
    available: providers.filter(p => p.status === 'available').length,
    busy: providers.filter(p => p.status === 'busy').length,
    offline: providers.filter(p => p.status === 'offline').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real-Time Monitoring</h1>
          <p className="text-gray-600 mt-1">Monitor all active service providers on the map</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Auto Refresh</span>
          </label>
          <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Available</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{statusCounts.available}</p>
            </div>
            <FiCheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Busy</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{statusCounts.busy}</p>
            </div>
            <FiClock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Offline</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statusCounts.offline}</p>
            </div>
            <FiXCircle className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <FiFilter className="text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All Categories</option>
            <option value="PSW">PSW</option>
            <option value="Office Support">Office Support</option>
          </select>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-[600px] bg-gray-100 flex items-center justify-center relative">
          <div className="text-center">
            <FiMap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Map integration will be displayed here</p>
            <p className="text-sm text-gray-500 mt-2">Showing {filteredProviders.length} providers</p>
          </div>
          
          {/* Provider List Overlay */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
            <h3 className="font-semibold text-gray-900 mb-3">Active Providers</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProviders.map((provider) => (
                <div key={provider.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <div className={`w-3 h-3 rounded-full ${
                    provider.status === 'available' ? 'bg-green-500' :
                    provider.status === 'busy' ? 'bg-yellow-500' :
                    'bg-gray-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{provider.name}</p>
                    <p className="text-xs text-gray-500">{provider.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

