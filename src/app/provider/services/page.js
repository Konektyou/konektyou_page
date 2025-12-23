'use client';

import { FiPlus, FiEdit, FiTrash2, FiCheckCircle, FiLoader, FiDollarSign, FiTag, FiInfo } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProviderToken } from '@/lib/providerAuth';
import ConfirmationModal from '@/components/admin/ConfirmationModal';

export default function ServicesPricing() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
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
        console.log('Fetched services:', data.services); // Debug log
        setServices(data.services || []);
      } else {
        setError(data.message || 'Failed to fetch services');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleService = async (serviceId) => {
    try {
      const token = getProviderToken();
      const service = services.find(s => s._id === serviceId);
      if (!service) return;

      const response = await fetch('/api/provider/services', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceId,
          active: !service.active
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchServices(); // Refresh services
      } else {
        alert(data.message || 'Failed to update service');
      }
    } catch (err) {
      console.error('Error toggling service:', err);
      alert('Failed to update service');
    }
  };

  const handleAddService = () => {
    router.push('/provider/services/add');
  };

  const handleEditService = (service) => {
    router.push(`/provider/services/edit/${service._id}`);
  };

  const handleDeleteService = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };


  const handleConfirmDelete = async () => {
    try {
      setSubmitting(true);
      const token = getProviderToken();
      const response = await fetch(`/api/provider/services?serviceId=${selectedService._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setShowDeleteModal(false);
        fetchServices(); // Refresh services
      } else {
        alert(data.message || 'Failed to delete service');
      }
    } catch (err) {
      console.error('Error deleting service:', err);
      alert('Failed to delete service');
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  const activeServices = services.filter(s => s.active).length;
  const inactiveServices = services.filter(s => !s.active).length;
  const totalRevenue = services.reduce((sum, s) => sum + (parseFloat(s.basePrice) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-600 mt-1">Manage your services and set pricing</p>
        </div>
        <button
          onClick={handleAddService}
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-sm"
        >
          <FiPlus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      {/* Stats Cards */}
      {services.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Active Services</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{activeServices}</p>
              </div>
              <div className="bg-green-500 rounded-full p-3">
                <FiCheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Services</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{services.length}</p>
              </div>
              <div className="bg-gray-500 rounded-full p-3">
                <FiTag className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Avg. Price</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  ${services.length > 0 ? (totalRevenue / services.length).toFixed(0) : '0'}
                </p>
              </div>
              <div className="bg-blue-500 rounded-full p-3">
                <FiDollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Grid */}
      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group"
            >
              {/* Card Header */}
              <div className={`p-4 border-b ${
                service.active ? 'bg-gradient-to-r from-green-50 to-white border-green-100' : 'bg-gray-50 border-gray-100'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{service.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      service.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {service.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-4">
                {service.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                )}

                <div className="space-y-3">
                  {(service.category || service.categoryName) && (
                    <div className="flex items-center gap-2">
                      <FiTag className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="text-sm font-medium text-gray-900">{service.categoryName || service.category}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-xl font-bold text-gray-900">
                        ${parseFloat(service.basePrice).toFixed(2)}
                        <span className="text-sm font-normal text-gray-600 ml-1">/{service.unit || 'per hour'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleService(service._id)}
                    className={`p-2 rounded-lg transition-colors ${
                      service.active
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title={service.active ? 'Deactivate' : 'Activate'}
                  >
                    <FiCheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditService(service)}
                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    title="Edit Service"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteService(service)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    title="Delete Service"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPlus className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Services Yet</h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            Add your first service to start receiving bookings from clients
          </p>
          <button
            onClick={handleAddService}
            className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-sm"
          >
            <span className="flex items-center gap-2">
              <FiPlus className="w-5 h-5" />
              Add Your First Service
            </span>
          </button>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Service"
        message={`Are you sure you want to delete "${selectedService?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
        icon={FiTrash2}
        iconColor="text-red-500"
      />

      {/* Pricing Info */}
      {services.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 rounded-lg p-2">
              <FiInfo className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Pricing Guidelines</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Base price is the minimum rate clients will see for your service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>You can adjust pricing for specific bookings if needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Platform commission (10%) is calculated on top of your base price</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Active services are visible to clients browsing providers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
