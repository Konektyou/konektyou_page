'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { FiMap, FiFilter, FiRefreshCw, FiUser, FiCheckCircle, FiX, FiLoader } from 'react-icons/fi';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-gray-100 flex items-center justify-center">
      <FiLoader className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  )
});

const DEFAULT_CENTER = [43.6532, -79.3832];

function getProviderPhotoUrl(provider) {
  if (!provider) return null;
  if (provider.photo && typeof provider.photo === 'string') return provider.photo;
  if (provider.photoPath && typeof provider.photoPath === 'string') {
    const path = provider.photoPath.replace(/^src[/\\]images[/\\]/i, '').replace(/^images[/\\]/i, '').trim();
    return path ? `/api/images/${path}` : null;
  }
  return null;
}

export default function RealTimeMonitoringPage() {
  const router = useRouter();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/monitoring/providers');
      const data = await res.json();
      if (data.success && Array.isArray(data.providers)) {
        setProviders(data.providers);
      } else {
        setProviders([]);
      }
    } catch (err) {
      console.error('Error fetching monitoring providers:', err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchProviders, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const categories = [...new Set(providers.map((p) => p.serviceType).filter(Boolean))].sort();
  const filteredProviders =
    selectedCategory === 'all'
      ? providers
      : providers.filter((p) => p.serviceType === selectedCategory);

  const mapCenter =
    filteredProviders.length > 0 && filteredProviders[0].position
      ? filteredProviders[0].position
      : DEFAULT_CENTER;

  const handleProviderClick = (providerId) => {
    const provider = providers.find((p) => p.id === providerId);
    if (provider) setSelectedProvider(provider);
  };

  const handleOpenDetails = () => {
    if (!selectedProvider) return;
    router.push(`/admin/users/provider/${selectedProvider.id}`);
    setSelectedProvider(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real-Time Monitoring</h1>
          <p className="text-gray-600 mt-1">Monitor providers with location on the map</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Auto Refresh (30s)</span>
          </label>
          <button
            type="button"
            onClick={() => fetchProviders()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">On Map</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{filteredProviders.length}</p>
            </div>
            <FiCheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total with location</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{providers.length}</p>
            </div>
            <FiUser className="w-8 h-8 text-gray-500" />
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Categories</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{categories.length}</p>
            </div>
            <FiFilter className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <FiFilter className="text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-[600px] relative">
          {loading && providers.length === 0 ? (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <FiLoader className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <MapComponent
              activeProviders={filteredProviders}
              torontoCenter={mapCenter}
              userLocation={null}
              fullScreen={false}
              onProviderClick={handleProviderClick}
            />
          )}
          {/* Provider list overlay */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-[1000]">
            <h3 className="font-semibold text-gray-900 mb-3">Providers on map</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProviders.length === 0 ? (
                <p className="text-sm text-gray-500">No providers with location</p>
              ) : (
                filteredProviders.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleProviderClick(provider.id)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 overflow-hidden flex items-center justify-center">
                      {getProviderPhotoUrl(provider) ? (
                        <img
                          src={getProviderPhotoUrl(provider)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {provider.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{provider.name}</p>
                      <p className="text-xs text-gray-500 truncate">{provider.serviceType || '—'}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Provider detail modal */}
      {selectedProvider && (
        <div
          className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelectedProvider(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                  {getProviderPhotoUrl(selectedProvider) ? (
                    <img
                      src={getProviderPhotoUrl(selectedProvider)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-500">
                      {selectedProvider.name?.charAt(0)?.toUpperCase() || 'P'}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedProvider.name}</h2>
                  {(selectedProvider.city || selectedProvider.province) && (
                    <p className="text-sm text-gray-600 mt-1">
                      {[selectedProvider.city, selectedProvider.province].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {selectedProvider.serviceType && (
                    <p className="text-sm text-gray-500 mt-0.5">{selectedProvider.serviceType}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProvider(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex gap-3">
              <button
                type="button"
                onClick={handleOpenDetails}
                className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Details
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
    </div>
  );
}
