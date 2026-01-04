'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiFilter, FiMessageCircle, FiEye, FiLoader, FiMapPin, FiStar, FiClock, FiCheckCircle, FiNavigation, FiAlertCircle } from 'react-icons/fi';
import { getClientToken } from '@/lib/clientAuth';
import MapComponent from '@/components/MapComponent';
import dynamic from 'next/dynamic';

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

  // Location and range state
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [locationLoading, setLocationLoading] = useState(true);
  const [serviceRange, setServiceRange] = useState(10); // Default 10km
  const [showMap, setShowMap] = useState(false); // Will be set to true when location is available
  const [selectedProvider, setSelectedProvider] = useState(null); // Selected provider for details panel

  useEffect(() => {
    requestUserLocation();
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

  // Request user location permission
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      // Default to Toronto if geolocation not available
      setUserLocation({ lat: 43.6532, lng: -79.3832 });
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError('');
        setLocationLoading(false);
        setShowMap(true); // Show map when location is available
      },
      (error) => {
        console.error('Location error:', error);
        setLocationError('Unable to get your location. Using default location.');
        // Default to Toronto
        setUserLocation({ lat: 43.6532, lng: -79.3832 });
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    filterServices();
  }, [searchTerm, filterCategory, allServices, userLocation, serviceRange]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

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
                providerStatus: provider.status,
                providerLocation: provider.location || null // Include provider location
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

    // Filter by distance if user location is available
    if (userLocation && serviceRange > 0) {
      filtered = filtered.filter(service => {
        // Check if provider has location data
        if (!service.providerLocation || !service.providerLocation.latitude || !service.providerLocation.longitude) {
          return false; // Hide providers without location
        }

        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          service.providerLocation.latitude,
          service.providerLocation.longitude
        );

        service.distance = distance; // Store distance for display
        return distance <= serviceRange;
      });

      // Sort by distance
      filtered.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
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
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[5px] shadow-sm p-6 text-white">
        <h1 className="text-3xl font-bold mb-1">Find Services</h1>
        <p className="text-gray-300 text-sm">Browse and book services from providers near you</p>
      </div>

      {/* Main Content Layout: Left (Filters + Services) | Right (Map) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Side: Filters and Services */}
        <div className="lg:col-span-2 space-y-4">

          {/* Location Status */}
          {locationError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-[5px] shadow-sm p-4 flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-yellow-800 text-sm">{locationError}</p>
                <button
                  onClick={requestUserLocation}
                  className="text-yellow-700 text-xs underline mt-1 hover:text-yellow-900"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-[5px] shadow-sm border border-gray-200 p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by service name, provider, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm transition-all"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FiFilter className="text-gray-600 w-5 h-5" />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm font-medium transition-all cursor-pointer"
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

              {/* Location and Range Controls */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 flex-1">
                  <FiNavigation className="text-gray-600 w-5 h-5" />
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Service Range</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={serviceRange}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 10;
                          if (value >= 5 && value <= 100) {
                            setServiceRange(value);
                          }
                        }}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm font-semibold text-gray-900"
                        placeholder="10"
                      />
                      <span className="text-sm font-semibold text-gray-900">km</span>
                    </div>
                  </div>
                </div>
                {userLocation && (
                  <button
                    onClick={requestUserLocation}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-[5px] text-sm font-medium hover:bg-gray-200 transition-all flex items-center gap-2"
                    title="Refresh location"
                  >
                    <FiNavigation className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {(loading || locationLoading) && (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600">
                {locationLoading ? 'Getting your location...' : 'Loading providers...'}
              </span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-[5px] shadow-sm p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Service Cards */}
          {!loading && !locationLoading && !error && (
            <>
              {services.length === 0 ? (
                <div className="bg-white rounded-[5px] shadow-sm border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiSearch className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-base font-medium">No services found matching your criteria.</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {userLocation && serviceRange > 0
                      ? `Try increasing your service range or adjusting your search filters`
                      : 'Try adjusting your search or filters'}
                  </p>
                  {userLocation && serviceRange > 0 && (
                    <button
                      onClick={() => setServiceRange(serviceRange + 10)}
                      className="mt-4 px-4 py-2 bg-black text-white rounded-[5px] hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm"
                    >
                      Increase Range to {serviceRange + 10} km
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => {
                    const isBooked = hasActiveBooking(service.id);
                    const priceDisplay = `$${service.basePrice}/${service.unit}`;

                    return (
                      <div
                        key={`${service.providerId}-${service.id}`}
                        className="bg-white rounded-[5px] shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group cursor-pointer"
                        onClick={() => setSelectedProvider(service)}
                      >
                        {/* Card Header */}
                        <div className={`relative ${isBooked
                            ? 'bg-gray-100'
                            : 'bg-white'
                          } p-6 border-b border-gray-100`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1">
                              {service.providerPhoto ? (
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={service.providerPhoto}
                                    alt={service.providerName}
                                    className="w-20 h-20 rounded-[5px] object-cover ring-2 ring-gray-100 shadow-sm"
                                  />
                                  {isBooked && (
                                    <div className="absolute -bottom-1 -right-1 bg-black rounded-[5px] p-1.5 ring-2 ring-white">
                                      <FiCheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="w-20 h-20 rounded-[5px] bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center ring-2 ring-gray-100 shadow-sm flex-shrink-0">
                                  <span className="text-white font-bold text-xl">
                                    {service.providerName?.charAt(0).toUpperCase() || 'P'}
                                  </span>
                                </div>
                              )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg line-clamp-2 leading-tight">{service.providerName}</h3>
                            <p className="text-sm font-semibold text-gray-700 line-clamp-2 mt-1 leading-tight">{service.name}</p>
                                {service.providerCity && (
                                  <div className="flex items-center gap-1 mt-2">
                                    <FiMapPin className="w-3 h-3 text-gray-400" />
                                    <p className="text-xs text-gray-500">
                                      {service.providerCity}{service.providerProvince ? `, ${service.providerProvince}` : ''}
                                      {service.distance !== undefined && (
                                        <span className="ml-1 font-semibold">• {service.distance.toFixed(1)} km away</span>
                                      )}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className={`px-3 py-1.5 text-xs font-semibold rounded-[5px] flex-shrink-0 shadow-sm ${service.providerStatus === 'available'
                                ? 'bg-black text-white'
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
                                <span className="px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-[5px] shadow-sm">
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartChat(service.providerId);
                                  }}
                                  className="px-5 py-2 bg-black text-white text-sm rounded-[5px] hover:bg-gray-800 transition-colors font-medium shadow-sm flex items-center gap-2"
                                >
                                  <FiMessageCircle className="w-4 h-4" />
                                  Chat
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBookNow(service.providerId, service.id);
                                  }}
                                  className="px-5 py-2 bg-black text-white text-sm rounded-[5px] hover:bg-gray-800 transition-colors font-medium shadow-sm"
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

        {/* Right Side: Map */}
        <div className="lg:col-span-1">
          {userLocation && !locationLoading ? (
            <div className="bg-white rounded-[5px] shadow-sm border border-gray-200 overflow-hidden sticky top-4" style={{ height: 'calc(100vh - 120px)', minHeight: '600px' }}>
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Service Providers Map</h2>
              </div>
              <div className="h-[calc(100%-73px)]">
                <MapComponent
                  userLocation={userLocation}
                  serviceRange={serviceRange}
                  activeProviders={services.map(service => ({
                    id: service.providerId,
                    name: service.providerName,
                    position: service.providerLocation
                      ? [service.providerLocation.latitude, service.providerLocation.longitude]
                      : null,
                    service: service.name,
                    photo: service.providerPhoto,
                    distance: service.distance,
                    serviceData: service // Pass full service data for details panel
                  })).filter(p => p.position !== null)}
                  onProviderClick={(providerId) => {
                    const service = services.find(s => s.providerId === providerId);
                    if (service) {
                      setSelectedProvider(service);
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[5px] shadow-sm border border-gray-200 p-12 text-center">
              <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <FiMapPin className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-600 text-sm">
                  {locationLoading ? 'Getting your location...' : 'Enable location to see providers on map'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Provider Details Panel/Modal */}
      {selectedProvider && (
        <div
          className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelectedProvider(null)}
        >
          <div
            className="bg-white rounded-[5px] shadow-sm border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {selectedProvider.providerPhoto ? (
                    <img
                      src={selectedProvider.providerPhoto}
                      alt={selectedProvider.providerName}
                      className="w-24 h-24 rounded-[5px] object-cover shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-[5px] bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-sm flex-shrink-0">
                      <span className="text-white font-bold text-2xl">
                        {selectedProvider.providerName?.charAt(0).toUpperCase() || 'P'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">{selectedProvider.providerName}</h2>
                    <p className="text-lg font-semibold text-gray-700 mb-2 line-clamp-2 leading-tight">{selectedProvider.name}</p>
                    {selectedProvider.providerCity && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FiMapPin className="w-4 h-4" />
                        <span>
                          {selectedProvider.providerCity}{selectedProvider.providerProvince ? `, ${selectedProvider.providerProvince}` : ''}
                          {selectedProvider.distance !== undefined && (
                            <span className="ml-1 font-semibold">• {selectedProvider.distance.toFixed(1)} km away</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Service Description */}
              {selectedProvider.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Service Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedProvider.description}</p>
                </div>
              )}

              {/* Service Details */}
              <div className="grid grid-cols-2 gap-4">
                {selectedProvider.category && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Category</p>
                    <span className="inline-block px-3 py-1 bg-black text-white text-sm font-medium rounded-[5px]">
                      {selectedProvider.category}
                    </span>
                  </div>
                )}
                {selectedProvider.providerExperience && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Experience</p>
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{selectedProvider.providerExperience}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 rounded-[5px] p-4">
                <p className="text-xs text-gray-500 mb-1">Pricing</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${selectedProvider.basePrice}/{selectedProvider.unit}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-[5px] ${selectedProvider.providerStatus === 'available'
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-700'
                  }`}>
                  {selectedProvider.providerStatus || 'available'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
              {hasActiveBooking(selectedProvider.id) ? (
                <button
                  onClick={() => {
                    handleStartChat(selectedProvider.providerId);
                    setSelectedProvider(null);
                  }}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-[5px] hover:bg-gray-800 transition-colors font-medium shadow-sm flex items-center justify-center gap-2"
                >
                  <FiMessageCircle className="w-5 h-5" />
                  Start Chat
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleBookNow(selectedProvider.providerId, selectedProvider.id);
                    setSelectedProvider(null);
                  }}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-[5px] hover:bg-gray-800 transition-colors font-medium shadow-sm"
                >
                  Book Now
                </button>
              )}
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-[5px] hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
