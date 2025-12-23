'use client';

import { useState } from 'react';
import { FiStar, FiSearch, FiFilter } from 'react-icons/fi';

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const reviews = [
    {
      id: 1,
      provider: 'John Doe',
      service: 'PSW',
      rating: 5,
      comment: 'Excellent service! Very professional and caring.',
      date: '2024-01-25',
      bookingId: 'BK001'
    },
    {
      id: 2,
      provider: 'Jane Smith',
      service: 'Office Support',
      rating: 4,
      comment: 'Great work, very efficient and helpful.',
      date: '2024-01-24',
      bookingId: 'BK002'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
        <p className="text-gray-600 mt-1">View and manage your reviews for service providers</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900">{review.provider}</h3>
                <p className="text-sm text-gray-500">{review.service} • Booking #{review.bookingId}</p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
            <p className="text-xs text-gray-500">{review.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

