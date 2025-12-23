'use client';

import { useState } from 'react';
import { FiMap, FiPhone, FiMessageCircle, FiClock, FiNavigation, FiCheckCircle } from 'react-icons/fi';

export default function ActiveBookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState(null);

  const activeBookings = [
    {
      id: 'BK001',
      provider: {
        name: 'John Doe',
        phone: '+1 234-567-8900',
        location: [43.6532, -79.3832],
        currentLocation: [43.6520, -79.3820]
      },
      service: 'PSW',
      startTime: '10:00 AM',
      duration: '2 hours',
      status: 'in-progress',
      estimatedArrival: '5 minutes'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Active Bookings</h1>
        <p className="text-gray-600 mt-1">Track your active service bookings in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map for Live Tracking */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-[500px] bg-gray-100 flex items-center justify-center relative">
            <div className="text-center">
              <FiMap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Live tracking map will be displayed here</p>
              <p className="text-sm text-gray-500 mt-2">Provider location updates in real-time</p>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-4">
          {activeBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Booking #{booking.id}</h3>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  {booking.status}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Provider</p>
                  <p className="font-medium text-gray-900">{booking.provider.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Service</p>
                  <p className="font-medium text-gray-900">{booking.service}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-gray-900">{booking.startTime} • {booking.duration}</p>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FiNavigation className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-xs text-green-600 font-medium">Estimated Arrival</p>
                      <p className="text-sm font-bold text-green-900">{booking.estimatedArrival}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <FiMessageCircle className="w-4 h-4" />
                    Chat
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <FiPhone className="w-4 h-4" />
                    Call
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

