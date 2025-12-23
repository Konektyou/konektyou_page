'use client';

import { FiDownload, FiFileText, FiCalendar, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

export default function BillingStatementsPage() {
  const statements = [
    {
      id: 'STMT-2025-01',
      period: 'January 2025',
      total: 2450.00,
      bookings: 12,
      subscription: 299.00,
      services: 2151.00
    },
    {
      id: 'STMT-2024-12',
      period: 'December 2024',
      total: 1890.00,
      bookings: 8,
      subscription: 299.00,
      services: 1591.00
    },
    {
      id: 'STMT-2024-11',
      period: 'November 2024',
      total: 3200.00,
      bookings: 15,
      subscription: 299.00,
      services: 2901.00
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing Statements</h1>
        <p className="text-gray-600 mt-1">View and download your monthly billing statements</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${statements[0].total.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{statements[0].bookings}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCalendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. per Booking</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${(statements[0].services / statements[0].bookings).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Statements List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Statements</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Statement ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Period</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Bookings</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Subscription</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Services</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Total</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {statements.map((statement) => (
                <tr key={statement.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{statement.id}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{statement.period}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{statement.bookings}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">${statement.subscription.toFixed(2)}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">${statement.services.toFixed(2)}</td>
                  <td className="py-4 px-4 text-sm font-bold text-gray-900">${statement.total.toFixed(2)}</td>
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
    </div>
  );
}

