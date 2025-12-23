'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiFilter, FiMessageCircle, FiEye, FiLoader, FiMapPin, FiStar, FiClock, FiCheckCircle } from 'react-icons/fi';
import { getClientToken } from '@/lib/clientAuth';

export default function ProvidersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientBookings, setClientBookings] = useState([]);

  useEffect(() => {
    fetchProviders();
    fetchClientBookings();
    
    // Refresh bookings when page becomes visible (e.g., returning from booking page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchClientBookings();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', fetchClientBookings);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchClientBookings);
    };
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchTerm, filterCategory, allServices]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/client/providers');
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories || []);
        
        // Transform providers into services array
        const servicesArray = [];
        data.providers.forEach(provider => {
          if (provider.services && provider.services.length > 0) {
            provider.services.forEach(service => {
              servicesArray.push({
                ...service,
                providerId: provider.id,
                providerName: provider.name,
                providerEmail: provider.email,
                providerPhone: provider.phone,
                providerPhoto: provider.photo,
                providerCity: provider.city,
                providerProvince: provider.province,
                providerExperience: provider.experience,
                providerStatus: provider.status
              });
            });
          }
        });
        
        setAllServices(servicesArray);
        filterServices(servicesArray);
      } else {
        setError(data.message || 'Failed to load providers');
      }
    } catch (err) {
      setError('Failed to load providers');
      console.error('Error fetching providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientBookings = async () => {
    try {
      const token = getClientToken();
      if (!token) return;

      const response = await fetch('/api/client/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setClientBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching client bookings:', err);
    }
  };

  const hasActiveBooking = (serviceId) => {
    return clientBookings.some(
      booking => 
        booking.serviceId === serviceId && 
        ['confirmed', 'in-progress'].includes(booking.status) &&
        booking.paymentStatus === 'paid'
    );
  };

  const filterServices = (servicesToFilter = allServices) => {
    let filtered = [...servicesToFilter];

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(service =>
        service.category === filterCategory ||
        service.categoryId === filterCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(service => {
        const searchLower = searchTerm.toLowerCase();
        return (
          service.providerName?.toLowerCase().includes(searchLower) ||
          service.providerEmail?.toLowerCase().includes(searchLower) ||
          service.name?.toLowerCase().includes(searchLower) ||
          service.description?.toLowerCase().includes(searchLower) ||
          service.category?.toLowerCase().includes(searchLower)
        );
      });
    }

    setServices(filtered);
  };

  const handleStartChat = (providerId) => {
    router.push(`/client/chat/${providerId}`);
  };

  const handleBookNow = (providerId, serviceId) => {
    router.push(`/client/book-provider/${providerId}?serviceId=${serviceId}`);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Find Services</h1>
        <p className="text-gray-300 text-lg">Browse and book services from providers near you</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by service name, provider, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FiFilter className="text-gray-600 w-5 h-5" />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm font-medium transition-all cursor-pointer"
            >
              <option value="all">All Services</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <FiLoader className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Service Cards */}
      {!loading && !error && (
        <>
          {services.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg font-medium">No services found matching your criteria.</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const isBooked = hasActiveBooking(service.id);
                const priceDisplay = `$${service.basePrice}/${service.unit}`;

                return (
                  <div
                    key={`${service.providerId}-${service.id}`}
                    className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1"
                  >
                    {/* Card Header with Gradient */}
                    <div className={`relative bg-gradient-to-br ${
                      isBooked 
                        ? 'from-blue-50 to-indigo-50' 
                        : 'from-gray-50 to-white'
                    } p-6 border-b border-gray-100`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          {service.providerPhoto ? (
                            <div className="relative">
                              <img
                                src={service.providerPhoto}
                                alt={service.providerName}
                                className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-md"
                              />
                              {isBooked && (
                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 ring-2 ring-white">
                                  <FiCheckCircle className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center ring-4 ring-white shadow-md">
                              <span className="text-white font-bold text-lg">
                                {service.providerName?.charAt(0).toUpperCase() || 'P'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate text-lg">{service.providerName}</h3>
                            <p className="text-sm font-semibold text-gray-700 truncate mt-1">{service.name}</p>
                            {service.providerCity && (
                              <div className="flex items-center gap-1 mt-2">
                                <FiMapPin className="w-3 h-3 text-gray-400" />
                                <p className="text-xs text-gray-500">
                                  {service.providerCity}{service.providerProvince ? `, ${service.providerProvince}` : ''}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full flex-shrink-0 shadow-sm ${
                          service.providerStatus === 'available' 
                            ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {service.providerStatus || 'available'}
                        </span>
                      </div>
                    </div>

                    {/* Service Details */}
                    <div className="p-6 space-y-4">
                      {service.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{service.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-3">
                        {service.providerExperience && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                            <FiClock className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-medium text-gray-700">{service.providerExperience}</span>
                          </div>
                        )}

                        {service.category && (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm">
                              {service.category}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Price</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{priceDisplay}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isBooked ? (
                            <button
                              onClick={() => handleStartChat(service.providerId)}
                              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                            >
                              <FiMessageCircle className="w-4 h-4" />
                              Chat
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBookNow(service.providerId, service.id)}
                              className="px-6 py-2.5 bg-gradient-to-r from-gray-900 to-black text-white text-sm rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                              Book Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
