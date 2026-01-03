'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiPercent, FiLoader } from 'react-icons/fi';
import { getAdminToken } from '@/lib/adminAuth';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState({
    commissionRate: 10
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      if (!token) {
        setError('Please login to view settings');
        return;
      }

      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(prev => ({
          ...prev,
          commissionRate: data.settings.commissionRate || 10
        }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const token = getAdminToken();
      if (!token) {
        setError('Please login to save settings');
        return;
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          commissionRate: parseFloat(settings.commissionRate)
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FiLoader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage platform settings and configurations</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

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
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.commissionRate}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  if (value >= 0 && value <= 100) {
                    setSettings({...settings, commissionRate: value});
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-lg font-semibold"
              />
              <span className="text-2xl font-bold text-gray-700">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Set the percentage commission you will take from each booking
            </p>
          </div>

          {/* Visual Preview */}
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Commission Preview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-600">Example Booking Amount:</span>
                <span className="text-lg font-bold text-gray-900">$100.00</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium mb-1">Admin Commission</p>
                  <p className="text-xl font-bold text-blue-900">
                    ${((100 * settings.commissionRate) / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">({settings.commissionRate}%)</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <p className="text-xs text-green-700 font-medium mb-1">Provider Earnings</p>
                  <p className="text-xl font-bold text-green-900">
                    ${(100 - (100 * settings.commissionRate) / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">({100 - settings.commissionRate}%)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Changing the commission rate will affect future bookings. Existing bookings will use the commission rate that was active at the time of booking.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FiSave className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}

