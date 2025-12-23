'use client';

import { useState } from 'react';
import { FiSave, FiDollarSign, FiPercent } from 'react-icons/fi';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    commissionRate: 10,
    subscriptionPrices: {
      basic: 99,
      premium: 199
    },
    pricing: {
      psw: 75,
      officeSupport: 100
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage platform settings and configurations</p>
      </div>

      {/* Commission Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiPercent className="w-5 h-5" />
          Commission Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commission Rate (%)
            </label>
            <input
              type="number"
              value={settings.commissionRate}
              onChange={(e) => setSettings({...settings, commissionRate: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* Subscription Pricing */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiDollarSign className="w-5 h-5" />
          Subscription Pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Basic Plan ($/month)
            </label>
            <input
              type="number"
              value={settings.subscriptionPrices.basic}
              onChange={(e) => setSettings({
                ...settings,
                subscriptionPrices: {...settings.subscriptionPrices, basic: e.target.value}
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Premium Plan ($/month)
            </label>
            <input
              type="number"
              value={settings.subscriptionPrices.premium}
              onChange={(e) => setSettings({
                ...settings,
                subscriptionPrices: {...settings.subscriptionPrices, premium: e.target.value}
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* Service Pricing */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Standardized Service Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PSW (per hour)
            </label>
            <input
              type="number"
              value={settings.pricing.psw}
              onChange={(e) => setSettings({
                ...settings,
                pricing: {...settings.pricing, psw: e.target.value}
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Office Support (per hour)
            </label>
            <input
              type="number"
              value={settings.pricing.officeSupport}
              onChange={(e) => setSettings({
                ...settings,
                pricing: {...settings.pricing, officeSupport: e.target.value}
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
          <FiSave className="w-4 h-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
}

