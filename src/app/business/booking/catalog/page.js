'use client';

import { FiUser, FiMapPin, FiStar, FiCheckCircle, FiFilter, FiSearch } from 'react-icons/fi';
import { useState } from 'react';

export default function ProviderCatalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const providers = [
    {
      id: 1,
      name: 'John Smith',
      service: 'PSW',
      rating: 4.8,
      reviews: 45,
      distance: '2.3 km',
      price: '$40/hr',
      verified: true,
      available: true,
      experience: '5 years',
      specialties: ['Elderly Care', 'Disability Support']
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      service: 'Office Support',
      rating: 4.9,
      reviews: 32,
      distance: '1.5 km',
      price: '$50/hr',
      verified: true,
      available: true,
      experience: '3 years',
      specialties: ['Administrative', 'Data Entry']
    },
    {
      id: 3,
      name: 'Michael Brown',
      service: 'Cleaning',
      rating: 4.7,
      reviews: 28,
      distance: '3.1 km',
      price: '$35/hr',
      verified: true,
      available: false,
      experience: '4 years',
      specialties: ['Commercial', 'Residential']
    },
    {
      id: 4,
      name: 'Emily Davis',
      service: 'PSW',
      rating: 5.0,
      reviews: 67,
      distance: '4.2 km',
      price: '$45/hr',
      verified: true,
      available: true,
      experience: '7 years',
      specialties: ['Palliative Care', 'Rehabilitation']
    },
  ];

  const categories = ['all', 'PSW', 'Office Support', 'Cleaning'];

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || provider.service === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Provider Catalog</h1>
        <p className="text-gray-600 mt-1">Browse verified service providers available for booking</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search providers by name or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterCategory === category
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
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
              {provider.verified && (
                <FiCheckCircle className="w-5 h-5 text-green-600" title="Verified" />
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900">{provider.rating}</span>
                <span className="text-sm text-gray-500">({provider.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiMapPin className="w-4 h-4" />
                <span>{provider.distance} away</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-900">{provider.price}</span>
                <span className="text-gray-600"> • {provider.experience} experience</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Specialties:</p>
              <div className="flex flex-wrap gap-1">
                {provider.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                provider.available
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {provider.available ? 'Available Now' : 'Unavailable'}
              </span>
              <button
                disabled={!provider.available}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  provider.available
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No providers found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

