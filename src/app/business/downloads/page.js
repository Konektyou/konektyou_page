'use client';

import Link from 'next/link';
import { FiFileText, FiDollarSign, FiCalendar, FiArrowRight } from 'react-icons/fi';

export default function DownloadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Downloads</h1>
        <p className="text-gray-600 mt-1">Download invoices, billing statements, and booking history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/business/downloads/invoices"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiFileText className="w-6 h-6 text-blue-600" />
            </div>
            <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Invoices</h3>
          <p className="text-gray-600 text-sm">
            Download and view your subscription invoices
          </p>
        </Link>

        <Link
          href="/business/downloads/billing"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
            <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Billing Statements</h3>
          <p className="text-gray-600 text-sm">
            View and download your monthly billing statements
          </p>
        </Link>

        <Link
          href="/business/downloads/history"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiCalendar className="w-6 h-6 text-purple-600" />
            </div>
            <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Booking History</h3>
          <p className="text-gray-600 text-sm">
            Download your complete booking history
          </p>
        </Link>
      </div>
    </div>
  );
}

