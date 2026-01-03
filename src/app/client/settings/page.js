'use client';

import { useState } from 'react';
import { FiBell, FiShield, FiSave } from 'react-icons/fi';

export default function ClientSettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    privacy: {
      showProfile: true,
      shareLocation: false
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Notifications */} 
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiBell className="w-5 h-5" />
          Notifications
        </h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700">Email Notifications</span>
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={(e) => setSettings({
                ...settings,
                notifications: {...settings.notifications, email: e.target.checked}
              })}
              className="w-4 h-4"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700">SMS Notifications</span>
            <input
              type="checkbox"
              checked={settings.notifications.sms}
              onChange={(e) => setSettings({
                ...settings,
                notifications: {...settings.notifications, sms: e.target.checked}
              })}
              className="w-4 h-4"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700">Push Notifications</span>
            <input
              type="checkbox"
              checked={settings.notifications.push}
              onChange={(e) => setSettings({
                ...settings,
                notifications: {...settings.notifications, push: e.target.checked}
              })}
              className="w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiShield className="w-5 h-5" />
          Privacy
        </h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700">Show Profile to Providers</span>
            <input
              type="checkbox"
              checked={settings.privacy.showProfile}
              onChange={(e) => setSettings({
                ...settings,
                privacy: {...settings.privacy, showProfile: e.target.checked}
              })}
              className="w-4 h-4"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700">Share Location for Better Matches</span>
            <input
              type="checkbox"
              checked={settings.privacy.shareLocation}
              onChange={(e) => setSettings({
                ...settings,
                privacy: {...settings.privacy, shareLocation: e.target.checked}
              })}
              className="w-4 h-4"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
          <FiSave className="w-4 h-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
}

