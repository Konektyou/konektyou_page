'use client';

import { FiX, FiLoader } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProviderToken } from '@/lib/providerAuth';

export default function AddServicePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [existingServices, setExistingServices] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    unit: 'per hour',
    category: '',
    active: true
  });

  useEffect(() => {
    fetchCategories();
    fetchExistingServices();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch('/api/service-categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchExistingServices = async () => {
    try {
      const token = getProviderToken();
      if (!token) return;

      const response = await fetch('/api/provider/services', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setExistingServices(data.services || []);
      }
    } catch (err) {
      console.error('Error fetching existing services:', err);
    }
  };

  const getUsedCategoryIds = () => {
    return existingServices
      .filter(service => service.categoryId)
      .map(service => service.categoryId.toString());
  };

  const getFirstNWords = (text, n = 12) => {
    if (!text || !text.trim()) return '';
    const words = text.trim().split(/\s+/);
    return words.slice(0, n).join(' ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.basePrice) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const token = getProviderToken();
      if (!token) {
        alert('Not authenticated');
        return;
      }

      const response = await fetch('/api/provider/services', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        router.push('/provider/services');
      } else {
        alert(data.message || 'Failed to add service');
      }
    } catch (err) {
      console.error('Error adding service:', err);
      alert('Failed to add service');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Service</h1>
          <p className="text-gray-600 mt-1">Create a new service for your profile</p>
        </div>
        <button
          onClick={() => router.push('/provider/services')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="e.g., PSW (Personal Support Worker)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              rows="4"
              placeholder="Describe your service..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="per hour">per hour</option>
                <option value="per day">per day</option>
                <option value="per session">per session</option>
                <option value="fixed">fixed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-xs text-gray-500">(One service per category)</span>
            </label>
            {loadingCategories ? (
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2">
                <FiLoader className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-gray-500">Loading categories...</span>
              </div>
            ) : (
              <>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">Select a category (optional)</option>
                  {categories.map((category) => {
                    const isUsed = getUsedCategoryIds().includes(category._id.toString());
                    const descriptionPreview = category.description 
                      ? ` - ${getFirstNWords(category.description, 12)}` 
                      : '';
                    return (
                      <option 
                        key={category._id} 
                        value={category._id}
                        disabled={isUsed}
                      >
                        {category.name}{descriptionPreview}{isUsed ? ' (Already used)' : ''}
                      </option>
                    );
                  })}
                </select>
                {getUsedCategoryIds().length > 0 && (
                  <p className="mt-2 text-xs text-gray-500">
                    Note: You can only create one service per category. Categories already in use are disabled.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
            />
            <label htmlFor="active" className="text-sm text-gray-700">
              Active (Service will be visible to clients)
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/provider/services')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Adding...
                </span>
              ) : (
                'Add Service'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Pricing Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-2">Pricing Guidelines</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Base price is the minimum rate for your service</li>
          <li>• You can adjust pricing for specific bookings if needed</li>
          <li>• Platform commission (10%) is calculated on top of your base price</li>
          <li>• Clients see your base price when browsing services</li>
        </ul>
      </div>
    </div>
  );
}

