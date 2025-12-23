'use client';

import { FiCalendar, FiDollarSign, FiUsers, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
import Link from 'next/link';

export default function BusinessDashboard() {
  const stats = [
    {
      title: 'Active Bookings',
      value: '5',
      icon: FiCalendar,
      color: 'bg-blue-500',
      href: '/business/booking/book'
    },
    {
      title: 'Shifts Used',
      value: '12 / 30',
      icon: FiClock,
      color: 'bg-yellow-500',
      href: '/business/booking/shifts'
    },
    {
      title: 'Available Providers',
      value: '24',
      icon: FiUsers,
      color: 'bg-green-500',
      href: '/business/booking/catalog'
    },
    {
      title: 'Monthly Spending',
      value: '$2,450',
      icon: FiDollarSign,
      color: 'bg-purple-500',
      href: '/business/downloads/billing'
    },
  ];

  const recentBookings = [
    {
      id: 'BK001',
      provider: 'John Smith',
      service: 'PSW',
      date: '2025-01-15',
      time: '9:00 AM - 5:00 PM',
      status: 'confirmed'
    },
    {
      id: 'BK002',
      provider: 'Sarah Johnson',
      service: 'Office Support',
      date: '2025-01-15',
      time: '10:00 AM - 2:00 PM',
      status: 'pending'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              href={stat.href}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Bookings & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{booking.provider}</h3>
                    <p className="text-sm text-gray-500">{booking.service}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    <span>{booking.date} • {booking.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/business/booking/catalog"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiUsers className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Browse Providers</p>
                <p className="text-sm text-gray-500">View catalog of verified service providers</p>
              </div>
            </Link>
            <Link
              href="/business/booking/book"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiCalendar className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Book Service</p>
                <p className="text-sm text-gray-500">Book on-demand service providers</p>
              </div>
            </Link>
            <Link
              href="/business/booking/shifts"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiClock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">View Shift Usage</p>
                <p className="text-sm text-gray-500">Track your shift usage and limits</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

