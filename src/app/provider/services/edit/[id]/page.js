'use client';

import { FiX, FiLoader } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getProviderToken } from '@/lib/providerAuth';

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
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
    fetchService();
    fetchCategories();
  }, [serviceId]);

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

  const fetchService = async () => {
    try {
      setLoading(true);
      const token = getProviderToken();
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/provider/services', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setExistingServices(data.services || []);
        const service = data.services.find(s => s._id === serviceId || s._id?.toString() === serviceId);
        if (service) {
          setFormData({
            name: service.name,
            description: service.description || '',
            basePrice: service.basePrice.toString(),
            unit: service.unit || 'per hour',
            category: service.categoryId?.toString() || service.categoryId || '',
            active: service.active !== undefined ? service.active : true
          });
        } else {
          setError('Service not found');
        }
      } else {
        setError(data.message || 'Failed to fetch service');
      }
    } catch (err) {
      console.error('Error fetching service:', err);
      setError('Failed to load service');
    } finally {
      setLoading(false);
    }
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
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceId,
          ...formData
        })
      });

      const data = await response.json();
      if (data.success) {
        router.push('/provider/services');
      } else {
        alert(data.message || 'Failed to update service');
      }
    } catch (err) {
      console.error('Error updating service:', err);
      alert('Failed to update service');
    } finally {
      setSubmitting(false);
    }
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
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
        <button
          onClick={() => router.push('/provider/services')}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Back to Services
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Service</h1>
          <p className="text-gray-600 mt-1">Update your service information</p>
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
                    // Check if category is used by another service (not the current one)
                    const isUsed = existingServices.some(
                      service => 
                        service.categoryId?.toString() === category._id.toString() &&
                        service._id?.toString() !== serviceId
                    );
                    return (
                      <option 
                        key={category._id} 
                        value={category._id}
                        disabled={isUsed}
                      >
                        {category.name}{isUsed ? ' (Already used)' : ''}
                      </option>
                    );
                  })}
                </select>
                {existingServices.some(s => s.categoryId && s._id?.toString() !== serviceId) && (
                  <p className="mt-2 text-xs text-gray-500">
                    Note: You can only create one service per category. Categories already in use by other services are disabled.
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
                  Updating...
                </span>
              ) : (
                'Update Service'
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

