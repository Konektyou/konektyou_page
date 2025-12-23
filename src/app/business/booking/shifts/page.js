'use client';

import { FiClock, FiCalendar, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function ShiftUsage() {
  const shiftData = {
    total: 30,
    used: 12,
    remaining: 18,
    period: 'January 2025'
  };

  const recentShifts = [
    {
      id: 'SH001',
      provider: 'John Smith',
      service: 'PSW',
      date: '2025-01-14',
      time: '9:00 AM - 5:00 PM',
      status: 'completed'
    },
    {
      id: 'SH002',
      provider: 'Sarah Johnson',
      service: 'Office Support',
      date: '2025-01-13',
      time: '10:00 AM - 2:00 PM',
      status: 'completed'
    },
    {
      id: 'SH003',
      provider: 'Michael Brown',
      service: 'Cleaning',
      date: '2025-01-15',
      time: '8:00 AM - 12:00 PM',
      status: 'scheduled'
    },
  ];

  const usagePercentage = (shiftData.used / shiftData.total) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Shift Usage</h1>
        <p className="text-gray-600 mt-1">Track your shift usage and remaining shifts</p>
      </div>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Shifts</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{shiftData.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiCalendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Used Shifts</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{shiftData.used}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Remaining Shifts</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{shiftData.remaining}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Usage Progress</h2>
          <span className="text-sm text-gray-600">{shiftData.period}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              usagePercentage >= 80 ? 'bg-red-600' : usagePercentage >= 50 ? 'bg-yellow-600' : 'bg-green-600'
            }`}
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">
          {shiftData.used} of {shiftData.total} shifts used ({Math.round(usagePercentage)}%)
        </p>
        {usagePercentage >= 80 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                You're running low on shifts. Consider upgrading your plan.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Shifts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Shifts</h2>
        <div className="space-y-4">
          {recentShifts.map((shift) => (
            <div
              key={shift.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium text-gray-900">{shift.provider}</h3>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    shift.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{shift.service}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FiCalendar className="w-4 h-4" />
                    <span>{shift.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    <span>{shift.time}</span>
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-600">{shift.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

