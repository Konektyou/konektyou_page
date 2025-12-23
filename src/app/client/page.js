'use client';

import { FiMap, FiCalendar, FiCreditCard, FiStar, FiClock, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';

export default function ClientDashboard() {
  const stats = [
    {
      title: 'Active Bookings',
      value: '2',
      icon: FiCalendar,
      color: 'bg-blue-500',
      href: '/client/bookings/active'
    },
    {
      title: 'Total Bookings',
      value: '12',
      icon: FiCheckCircle,
      color: 'bg-green-500',
      href: '/client/bookings/history'
    },
    {
      title: 'Saved Providers',
      value: '5',
      icon: FiMap,
      color: 'bg-purple-500',
      href: '/client/providers'
    },
    {
      title: 'My Reviews',
      value: '8',
      icon: FiStar,
      color: 'bg-yellow-500',
      href: '/client/reviews'
    },
  ];

  const recentBookings = [
    {
      id: 'BK001',
      provider: 'John Doe',
      service: 'PSW',
      date: '2024-01-25',
      time: '10:00 AM',
      status: 'active'
    },
    {
      id: 'BK002',
      provider: 'Jane Smith',
      service: 'Office Support',
      date: '2024-01-24',
      time: '2:00 PM',
      status: 'completed'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your activity overview.</p>
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

      {/* Quick Actions & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/client/providers/map"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiMap className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Find Providers</p>
                <p className="text-sm text-gray-500">Browse nearby service providers</p>
              </div>
            </Link>
            <Link
              href="/client/payments"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiCreditCard className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Add Payment Method</p>
                <p className="text-sm text-gray-500">Manage your payment options</p>
              </div>
            </Link>
            <Link
              href="/client/bookings/active"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiClock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Track Active Booking</p>
                <p className="text-sm text-gray-500">View live location of provider</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/client/bookings/${booking.id}`}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{booking.provider}</p>
                  <p className="text-sm text-gray-500">{booking.service}</p>
                  <p className="text-xs text-gray-400 mt-1">{booking.date} at {booking.time}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${booking.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                  {booking.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

