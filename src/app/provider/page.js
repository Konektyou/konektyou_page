'use client';

import { FiCalendar, FiDollarSign, FiCheckCircle, FiClock, FiAlertCircle, FiMap, FiLoader } from 'react-icons/fi';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getProviderToken } from '@/lib/providerAuth';

export default function ProviderDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = getProviderToken();
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/provider/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    // If timeString is already formatted, return as is
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    // Otherwise, format it
    return timeString;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FiLoader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  const stats = [
    {
      title: 'Today\'s Bookings',
      value: dashboardData?.stats?.todayBookings?.toString() || '0',
      icon: FiCalendar,
      color: 'bg-blue-500',
      href: '#'
    },
    {
      title: 'Total Earnings',
      value: formatCurrency(dashboardData?.stats?.totalEarnings || 0),
      icon: FiDollarSign,
      color: 'bg-green-500',
      href: '/provider/earnings'
    },
    {
      title: 'Completed Jobs',
      value: dashboardData?.stats?.completedJobs?.toString() || '0',
      icon: FiCheckCircle,
      color: 'bg-purple-500',
      href: '#'
    },
    {
      title: 'Pending Approval',
      value: dashboardData?.stats?.pendingApproval?.toString() || '0',
      icon: FiAlertCircle,
      color: 'bg-yellow-500',
      href: '/provider/verification/onboarding'
    },
  ];

  const todayBookings = dashboardData?.todayBookings || [];
  const providerName = dashboardData?.profile?.name || 'Provider';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {providerName}! Here's your work overview.</p>
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

      {/* Today's Bookings & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Bookings</h2>
          <div className="space-y-4">
            {todayBookings.length > 0 ? (
              todayBookings.map((booking) => (
                <div
                  key={booking.id || booking._id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{booking.clientName || booking.client || 'Client'}</h3>
                      <p className="text-sm text-gray-500">{booking.serviceType || booking.service || 'Service'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      booking.status === 'confirmed' || booking.status === 'accepted' 
                        ? 'bg-green-100 text-green-800' 
                        : booking.status === 'pending' || booking.status === 'requested'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status || 'pending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {booking.time && (
                      <div className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        <span>{formatTime(booking.time)}</span>
                      </div>
                    )}
                    {booking.location && (
                      <div className="flex items-center gap-1">
                        <FiMap className="w-4 h-4" />
                        <span>{booking.location}</span>
                      </div>
                    )}
                  </div>
                  {(booking.status === 'pending' || booking.status === 'requested') && (
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                        Accept
                      </button>
                      <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiCalendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No bookings for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/provider/services"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiDollarSign className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Manage Services & Pricing</p>
                <p className="text-sm text-gray-500">Update your services and rates</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

