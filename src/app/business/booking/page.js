'use client';

import Link from 'next/link';
import { FiUsers, FiCreditCard, FiFileText, FiCalendar, FiClock, FiMap, FiArrowRight } from 'react-icons/fi';

export default function BookingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Booking & Operations</h1>
        <p className="text-gray-600 mt-1">Manage your bookings and service provider operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/business/booking/catalog"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
            <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Provider Catalog</h3>
          <p className="text-gray-600 text-sm">
            Browse catalog of verified service providers available for booking
          </p>
        </Link>

        <Link
          href="/business/booking/subscription"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCreditCard className="w-6 h-6 text-green-600" />
            </div>
            <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Subscription</h3>
          <p className="text-gray-600 text-sm">
            Subscribe to a plan to start booking service providers
          </p>
        </Link>

        <Link
          href="/business/booking/waiver"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiFileText className="w-6 h-6 text-yellow-600" />
            </div>
            <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Waiver</h3>
          <p className="text-gray-600 text-sm">
            Review and accept business waiver requirements
          </p>
        </Link>

        <Link
          href="/business/booking/book"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiCalendar className="w-6 h-6 text-purple-600" />
            </div>
            <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Book Service</h3>
          <p className="text-gray-600 text-sm">
            Book on-demand service providers for your business needs
          </p>
        </Link>

        <Link
          href="/business/booking/shifts"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FiClock className="w-6 h-6 text-orange-600" />
            </div>
            <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Shift Usage</h3>
          <p className="text-gray-600 text-sm">
            View your shift usage and remaining shifts
          </p>
        </Link>

        <Link
          href="/business/booking/availability"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FiMap className="w-6 h-6 text-indigo-600" />
            </div>
            <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Track Availability</h3>
          <p className="text-gray-600 text-sm">
            Track real-time availability of service providers
          </p>
        </Link>
      </div>
    </div>
  );
}

