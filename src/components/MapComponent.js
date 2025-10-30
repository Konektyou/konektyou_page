'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapComponent({ activeProviders, torontoCenter }) {
  const [isClient, setIsClient] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window !== 'undefined') {
      setIsClient(true);
      
      // Fix for default markers in react-leaflet
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Add a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsMapReady(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  // Modern 3D marker icon for service providers
  const customIcon = isClient ? new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="80" height="100" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Drop shadow -->
        <ellipse cx="42" cy="95" rx="12" ry="4" fill="#000000" opacity="0.2"/>
        
        <!-- Main pin body with 3D gradient -->
        <defs>
          <linearGradient id="pinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:0.7" />
            <stop offset="50%" style="stop-color:#3B82F6;stop-opacity:0.7" />
            <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:0.7" />
          </linearGradient>
          <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:#F8FAFC;stop-opacity:0.8" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Pin body with 3D effect -->
        <path d="M40 15C25.641 15 14 26.641 14 41c0 25 26 35 26 35s26-10 26-35C66 26.641 54.359 15 40 15z" 
              fill="url(#pinGradient)" 
              stroke="#1E40AF" 
              stroke-width="2"
              filter="url(#glow)"
              opacity="0.8"/>
        
        <!-- Inner circle with 3D effect -->
        <circle cx="40" cy="41" r="18" fill="url(#innerGradient)" stroke="#E5E7EB" stroke-width="2" opacity="0.8"/>
        
        <!-- Status indicator dot -->
        <circle cx="40" cy="41" r="6" fill="#10B981" stroke="#FFFFFF" stroke-width="2" opacity="0.9"/>
        
        
    
      </svg>
    `),
    iconSize: [50, 65],
    iconAnchor: [40, 90],
    popupAnchor: [0, -90],
  }) : null;

  if (!isClient || !isMapReady) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  // Additional check to ensure window is available
  if (typeof window === 'undefined') {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-gray-100">
      <style jsx global>{`
        .leaflet-control-container {
          display: none !important;
        }
        .leaflet-control-attribution {
          display: none !important;
        }
        .leaflet-control-zoom {
          display: none !important;
        }
        .leaflet-bottom {
          display: none !important;
        }
        .leaflet-top {
          display: none !important;
        }
        .leaflet-container {
          background: #f8fafc !important;
        }
      `}</style>
      <MapContainer
        center={torontoCenter}
        zoom={12}
        style={{ height: '100%', width: '100%', background: '#f8fafc' }}
        className="rounded-2xl"
        zoomControl={false}
        attributionControl={false}
      >
      <TileLayer
        attribution=""
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      
      {/* Service coverage area circle */}
      {/* <Circle
        center={torontoCenter}
        radius={15000} // 15km radius for Toronto
        pathOptions={{
          color: '#3B82F6',
          fillColor: '#3B82F6',
          fillOpacity: 0.15,
          weight: 3,
          dashArray: '8, 8'
        }}
      /> */}
      
      {/* Service provider markers */}
      {activeProviders.map((provider) => (
        <Marker
          key={provider.id}
          position={provider.position}
          icon={customIcon}
        >
          <Popup className="custom-popup">
            <div className="p-4 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl min-w-[240px] border border-blue-200 backdrop-blur-sm">
              {/* Header with 3D effect */}
              <div className="flex items-center space-x-4 mb-3">
                <div className="relative">
                  <div className="text-3xl border-2 border-blue-300 rounded-xl p-2 bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg">
                    {provider.photo}
                  </div>
                  {/* Online status indicator */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div className='flex flex-col flex-1'>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">
                    {provider.name}
                  </h3>
                  <p className="text-blue-600 text-sm font-semibold bg-blue-100 px-2 py-1 rounded-full inline-block w-fit">
                    {provider.service}
                  </p>
                </div>
              </div>
              
              {/* Stats with modern design */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-1">
                  <div className="flex text-yellow-500">
                    <span className="text-sm">⭐</span>
                  </div>
                  <span className="text-gray-800 font-bold text-sm">{provider.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-bold text-sm">{provider.distance}</span>
                </div>
              </div>
              
              {/* Action button */}
              <div className="mt-3 pt-3">
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Book Now
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      </MapContainer>
    </div>
  );
}
