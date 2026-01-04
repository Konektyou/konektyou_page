'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Component to update map center when position changes
function MapCenterUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2) {
      map.setView(center, zoom || 12);
    }
  }, [center, zoom, map]);
  return null;
}

export default function LocationPickerMap({ initialLat = 43.6532, initialLng = -79.3832, onLocationSelect, readOnly = false, onGetCurrentLocation, onLocationWithCity }) {
  const [isClient, setIsClient] = useState(false);
  const [position, setPosition] = useState([initialLat, initialLng]);
  const markerRef = useRef(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    // Only run on client side
    setIsClient(true);
    
    // Fix for default markers in react-leaflet
    if (typeof window !== 'undefined' && typeof L !== 'undefined') {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  useEffect(() => {
    setPosition([initialLat, initialLng]);
  }, [initialLat, initialLng]);

  // Reverse geocoding function to get city from coordinates
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Konektly Location Picker' // Required by Nominatim
          }
        }
      );
      const data = await response.json();
      
      if (data && data.address) {
        // Try to get city from various possible fields
        const city = data.address.city || 
                     data.address.town || 
                     data.address.village || 
                     data.address.municipality ||
                     data.address.county ||
                     '';
        return city;
      }
      return '';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return '';
    }
  };

  // Function to get current location using browser geolocation
  const getCurrentLocation = async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setPosition([latitude, longitude]);
        
        // Get city name from coordinates
        const city = await reverseGeocode(latitude, longitude);
        
        if (onLocationSelect) {
          onLocationSelect(latitude, longitude);
        }
        
        // Call callback with city information if provided
        if (onLocationWithCity) {
          onLocationWithCity(latitude, longitude, city);
        }
        
        setLocationLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get your location. Please click on the map to set it manually.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please allow location access and try again.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable. Please click on the map to set it manually.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out. Please try again or click on the map.';
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Expose function to get current location via ref
  useEffect(() => {
    if (onGetCurrentLocation && isClient) {
      // Expose the getCurrentLocation function to parent via ref
      onGetCurrentLocation.current = getCurrentLocation;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, onGetCurrentLocation]);

  // Custom marker icon for location selection
  const locationIcon = isClient && typeof window !== 'undefined' && typeof L !== 'undefined' ? new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 5C12.268 5 6 11.268 6 19c0 12 14 21 14 21s14-9 14-21C34 11.268 27.732 5 20 5z" 
              fill="#3B82F6" 
              stroke="#1E40AF" 
              stroke-width="2"/>
        <circle cx="20" cy="19" r="8" fill="#FFFFFF" stroke="#3B82F6" stroke-width="2"/>
        <circle cx="20" cy="19" r="4" fill="#3B82F6"/>
      </svg>
    `),
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50],
  }) : null;

  function MapClickHandler() {
    const map = useMapEvents({
      click: async (e) => {
        if (!readOnly) {
          const { lat, lng } = e.latlng;
          setPosition([lat, lng]);
          if (onLocationSelect) {
            onLocationSelect(lat, lng);
          }
          // Also try to get city for manual clicks (optional)
          if (onLocationWithCity) {
            const city = await reverseGeocode(lat, lng);
            if (city) {
              onLocationWithCity(lat, lng, city);
            }
          }
        }
      },
    });
    return null;
  }

  // Always return consistent markup to avoid hydration issues
  if (!isClient || typeof window === 'undefined') {
    return (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center" suppressHydrationWarning>
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative h-64 w-full rounded-lg overflow-hidden border-2 border-gray-300">
      <style jsx global>{`
        .leaflet-container {
          height: 100%;
          width: 100%;
        }
        .leaflet-control-container {
          display: block !important;
        }
      `}</style>
      <MapContainer
        center={position}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenterUpdater center={position} zoom={14} />
        <MapClickHandler />
        <Marker
          position={position}
          icon={locationIcon}
          ref={markerRef}
        />
      </MapContainer>
      {!readOnly && (
        <>
          {/* <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-md text-sm z-[1000]">
            <p className="font-semibold text-gray-800">Click on map to set location</p>
          </div> */}
          {locationLoading && (
            <div className="absolute top-12 left-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg shadow-md text-sm z-[1000] flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-800 text-xs">Getting your location...</p>
            </div>
          )}
          {locationError && (
            <div className="absolute top-12 left-2 bg-red-50 border border-red-200 px-3 py-2 rounded-lg shadow-md text-sm z-[1000] max-w-xs">
              <p className="text-red-800 text-xs">{locationError}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

