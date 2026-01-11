'use client';

import { useState, useEffect } from 'react';
import { FiMap, FiCalendar, FiCreditCard, FiStar, FiClock, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { getClientToken } from '@/lib/clientAuth';

export default function ClientDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    activeBookings: 0,
    totalBookings: 0,
    savedProviders: 0,
    myReviews: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getClientToken();
      if (!token) {
        setError('Please login to view your dashboard');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/client/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setRecentBookings(data.recentBookings);
      } else {
        setError(data.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      title: 'Active Bookings',
      value: stats.activeBookings,
      icon: FiCalendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: FiCheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Saved Providers',
      value: stats.savedProviders,
      icon: FiMap,
      color: 'bg-purple-500'
    },
    {
      title: 'My Reviews',
      value: stats.myReviews,
      icon: FiStar,
      color: 'bg-yellow-500'
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiLoader className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your activity overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
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
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <FiMap className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Find Providers</p>
                <p className="text-sm text-gray-500">Browse nearby service providers</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <FiCreditCard className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Payment Methods</p>
                <p className="text-sm text-gray-500">Manage your payment options</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <FiClock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Track Active Booking</p>
                <p className="text-sm text-gray-500">View live location of provider</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No bookings yet</p>
              <p className="text-sm text-gray-400 mt-1">Your recent bookings will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{booking.provider}</p>
                    <p className="text-sm text-gray-500">{booking.service}</p>
                    <p className="text-xs text-gray-400 mt-1">{booking.date} at {booking.time}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
