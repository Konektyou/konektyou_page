'use client';

import { FiDownload, FiCalendar, FiUser, FiClock, FiFilter } from 'react-icons/fi';
import { useState } from 'react';

export default function BookingHistoryPage() {
  const [filter, setFilter] = useState('all');

  const bookings = [
    {
      id: 'BK001',
      provider: 'John Smith',
      service: 'PSW',
      date: '2025-01-14',
      time: '9:00 AM - 5:00 PM',
      status: 'completed',
      amount: 320.00
    },
    {
      id: 'BK002',
      provider: 'Sarah Johnson',
      service: 'Office Support',
      date: '2025-01-13',
      time: '10:00 AM - 2:00 PM',
      status: 'completed',
      amount: 200.00
    },
    {
      id: 'BK003',
      provider: 'Michael Brown',
      service: 'Cleaning',
      date: '2025-01-12',
      time: '8:00 AM - 12:00 PM',
      status: 'completed',
      amount: 140.00
    },
    {
      id: 'BK004',
      provider: 'Emily Davis',
      service: 'PSW',
      date: '2025-01-11',
      time: '2:00 PM - 6:00 PM',
      status: 'cancelled',
      amount: 160.00
    },
  ];

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
        <p className="text-gray-600 mt-1">View and download your booking history</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <FiFilter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          {['all', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Booking ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Provider</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Service</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{booking.id}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{booking.provider}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{booking.service}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{booking.date}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{booking.time}</td>
                  <td className="py-4 px-4 text-sm font-bold text-gray-900">${booking.amount.toFixed(2)}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      booking.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <FiDownload className="w-4 h-4" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBookings.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No bookings found for this filter.</p>
        </div>
      )}
    </div>
  );
}

