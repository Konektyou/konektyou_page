'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  FiLoader,
  FiMenu,
  FiX,
  FiHome,
  FiMap,
  FiCalendar,
  FiCreditCard,
  FiStar,
  FiUser,
  FiSettings,
  FiLogOut,
  FiSearch,
  FiFilter
} from 'react-icons/fi';
import MapComponent from '@/components/MapComponent';
import { clearClientAuth, getClientToken } from '@/lib/clientAuth';
import PremiumSubscriptionModal from '@/components/client/PremiumSubscriptionModal';

const ClientProvidersPage = dynamic(() => import('@/app/client/providers/page'), { ssr: false });
const ClientBookingsPage = dynamic(() => import('@/app/client/bookings/page'), { ssr: false });
const ClientPaymentsPage = dynamic(() => import('@/app/client/payments/page'), { ssr: false });
const ClientReviewsPage = dynamic(() => import('@/app/client/reviews/page'), { ssr: false });
const ClientProfilePage = dynamic(() => import('@/app/client/profile/page'), { ssr: false });
const ClientSettingsPage = dynamic(() => import('@/app/client/settings/page'), { ssr: false });

export default function ClientDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState([]);
  const [allProviders, setAllProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [bookingProviderId, setBookingProviderId] = useState(null);
  const [menuPageKey, setMenuPageKey] = useState(null);
  const [menuPageTitle, setMenuPageTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [pendingBookingProviderId, setPendingBookingProviderId] = useState(null);

  useEffect(() => {
    requestUserLocation();
    fetchProviders();
    checkSubscriptionStatus();

    // Check for subscription success from Stripe redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('subscription') === 'success') {
      // Wait a bit for webhook to process, then check status
      setTimeout(() => {
        checkSubscriptionStatus();
      }, 2000);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    filterProviders();
  }, [searchTerm, filterCategory, allProviders]);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      // Default to Toronto if geolocation not available
      setUserLocation({ lat: 43.6532, lng: -79.3832 });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError('');
        setLoading(false);
      },
      (error) => {
        console.error('Location error:', error);
        setLocationError('Unable to get your location. Using default location.');
        // Default to Toronto
        setUserLocation({ lat: 43.6532, lng: -79.3832 });
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/client/providers');
      const data = await response.json();

      if (data.success && data.providers) {
        setCategories(data.categories || []);
        
        // Transform providers to include position for map
        const providersWithPosition = data.providers
          .filter(provider => provider.location && provider.location.latitude && provider.location.longitude)
          .map(provider => ({
            ...provider,
            position: [provider.location.latitude, provider.location.longitude]
          }));
        setAllProviders(providersWithPosition);
        filterProviders(providersWithPosition);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
    }
  };

  const filterProviders = (providersToFilter = allProviders) => {
    let filtered = [...providersToFilter];

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(provider => {
        // Check if provider has any service matching the category
        if (provider.services && provider.services.length > 0) {
          return provider.services.some(service => 
            service.category === filterCategory || 
            service.categoryId === filterCategory
          );
        }
        return false;
      });
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(provider => {
        // Search in provider name, email, city, province
        const matchesProvider = 
          provider.name?.toLowerCase().includes(searchLower) ||
          provider.email?.toLowerCase().includes(searchLower) ||
          provider.city?.toLowerCase().includes(searchLower) ||
          provider.province?.toLowerCase().includes(searchLower);
        
        // Search in services
        const matchesService = provider.services?.some(service =>
          service.name?.toLowerCase().includes(searchLower) ||
          service.description?.toLowerCase().includes(searchLower) ||
          service.category?.toLowerCase().includes(searchLower)
        );

        return matchesProvider || matchesService;
      });
    }

    setFilteredProviders(filtered);
    setProviders(filtered);
  };

  const checkSubscriptionStatus = async () => {
    try {
      const token = getClientToken();
      if (!token) return;

      const response = await fetch('/api/client/subscription', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setHasActiveSubscription(data.isActive || false);
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
    }
  };

  const handleProviderClick = (providerId) => {
    const provider = providers.find((item) => item.id === providerId);
    if (provider) {
      setSelectedProvider(provider);
    }
  };

  const handleBookNow = (providerId) => {
    if (!hasActiveSubscription) {
      setPendingBookingProviderId(providerId);
      setShowSubscriptionModal(true);
    } else {
      setBookingProviderId(providerId);
    }
  };

  const handleSubscriptionSuccess = () => {
    setHasActiveSubscription(true);
    if (pendingBookingProviderId) {
      setBookingProviderId(pendingBookingProviderId);
      setPendingBookingProviderId(null);
    }
  };

  const menuItems = [
    { title: 'My Bookings', icon: FiCalendar, key: 'bookings' },
    { title: 'Payment Methods', icon: FiCreditCard, key: 'payments' },
    { title: 'Reviews & Ratings', icon: FiStar, key: 'reviews' },
    { title: 'Profile', icon: FiUser, key: 'profile' },
    { title: 'Settings', icon: FiSettings, key: 'settings' },
  ];

  const renderMenuPage = () => {
    switch (menuPageKey) {
      case 'dashboard':
        return (
          <div className="p-6 text-sm text-gray-600">
            Dashboard is available on the main map screen.
          </div>
        );
      case 'providers':
        return <ClientProvidersPage />;
      case 'bookings':
        return <ClientBookingsPage />;
      case 'payments':
        return <ClientPaymentsPage />;
      case 'reviews':
        return <ClientReviewsPage />;
      case 'profile':
        return <ClientProfilePage />;
      case 'settings':
        return <ClientSettingsPage />;
      default:
        return null;
    }
  };

  if (loading || !userLocation) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <FiLoader className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <MapComponent
        activeProviders={providers}
        userLocation={userLocation}
        serviceRange={10}
        onProviderClick={handleProviderClick}
      />

      {/* Top-left menu */}
      <div className="fixed top-4 left-4 z-[1000]">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Open menu"
        >
          {menuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>

        {menuOpen && (
          <div className="mt-3 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 max-h-[70vh] overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setMenuPageTitle(item.title);
                    setMenuPageKey(item.key);
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{item.title}</span>
                </button>
              );
            })}
            <div className="border-t border-gray-200 my-1"></div>
            <button
              type="button"
              onClick={() => {
                clearClientAuth();
                setMenuOpen(false);
                router.push('/login?role=client');
                router.refresh();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Top-center filters */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[1000] flex items-center gap-3">
        <div className="flex items-center gap-3 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
          {/* Search Input */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by service name, provider, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm w-80 transition-all"
            />
          </div>
          
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FiFilter className="text-gray-600 w-5 h-5" />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm font-medium transition-all cursor-pointer"
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

      {/* Provider Details Modal */}
      {selectedProvider && (
        <div
          className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelectedProvider(null)}
        >
          <div
            className="bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-start justify-between">
              <div className="flex items-start gap-4">
                {selectedProvider.photo ? (
                  <img
                    src={selectedProvider.photo}
                    alt={selectedProvider.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-600">
                      {selectedProvider.name?.charAt(0).toUpperCase() || 'P'}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedProvider.name}</h2>
                  {(selectedProvider.city || selectedProvider.province) && (
                    <p className="text-sm text-gray-600">
                      {selectedProvider.city}{selectedProvider.province ? `, ${selectedProvider.province}` : ''}
                    </p>
                  )}
                  {selectedProvider.experience && (
                    <p className="text-sm text-gray-500 mt-1">Experience: {selectedProvider.experience}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProvider(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {(selectedProvider.phone || selectedProvider.email) && (
                <div className="text-sm text-gray-700">
                  {selectedProvider.phone && <p>Phone: {selectedProvider.phone}</p>}
                  {selectedProvider.email && <p>Email: {selectedProvider.email}</p>}
                </div>
              )}

              {selectedProvider.services?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Services</h3>
                  <div className="space-y-2">
                    {selectedProvider.services.map((service) => (
                      <div
                        key={service.id}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-700">
                            ${service.basePrice}/{service.unit}
                          </p>
                        </div>
                        {service.category && (
                          <p className="text-xs text-gray-500 mt-1">{service.category}</p>
                        )}
                        {service.description && (
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">{service.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  handleBookNow(selectedProvider.id);
                }}
                className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Book Now
              </button>
              <button
                type="button"
                onClick={() => setSelectedProvider(null)}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingProviderId && (
        <div
          className="fixed inset-0 bg-black/60 z-[10000] flex items-center justify-center p-2 sm:p-4"
          onClick={() => setBookingProviderId(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Book Provider</h3>
              <button
                type="button"
                onClick={() => setBookingProviderId(null)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close booking"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <iframe
                title="Book Provider"
                src={`/client/book-provider/${bookingProviderId}`}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Premium Subscription Modal */}
      <PremiumSubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => {
          setShowSubscriptionModal(false);
          setPendingBookingProviderId(null);
        }}
        onSubscribeSuccess={handleSubscriptionSuccess}
      />

      {/* Menu Page Modal */}
      {menuPageKey && (
        <div
          className="fixed inset-0 bg-black/60 z-[10001] flex items-center justify-center p-2 sm:p-4"
          onClick={() => setMenuPageKey(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">{menuPageTitle || 'Client Menu'}</h3>
              <button
                type="button"
                onClick={() => setMenuPageKey(null)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close menu"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Suspense
                fallback={
                  <div className="h-full w-full flex items-center justify-center">
                    <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                }
              >
                <div className="p-4">
                  {renderMenuPage()}
                </div>
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
