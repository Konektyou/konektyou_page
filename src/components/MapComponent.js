'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Component to update map center when user location changes
function MapCenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 12);
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ 
  activeProviders = [], 
  torontoCenter = [43.6532, -79.3832],
  userLocation = null,
  serviceRange = 10,
  onProviderClick = null
}) {
  const [isClient, setIsClient] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  
  // Use user location as center if available, otherwise use torontoCenter
  const mapCenter = userLocation ? [userLocation.lat, userLocation.lng] : torontoCenter;

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

      // Add a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsMapReady(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  // Modern 3D marker icon for service providers
  const customIcon = isClient && typeof window !== 'undefined' && typeof L !== 'undefined' ? new L.Icon({
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

  // Always return consistent markup to avoid hydration issues
  if (!isClient || !isMapReady || typeof window === 'undefined') {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center" suppressHydrationWarning>
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
        center={mapCenter}
        zoom={userLocation ? 12 : 12}
        style={{ height: '100%', width: '100%', background: '#f8fafc' }}
        className="rounded-2xl"
        zoomControl={true}
        attributionControl={false}
      >
      <MapCenter center={mapCenter} zoom={userLocation ? 12 : 12} />
      <TileLayer
        attribution=""
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      
      {/* User location marker */}
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={isClient && typeof L !== 'undefined' ? new L.Icon({
            iconUrl: 'data:image/svg+xml;base64,' + btoa(`
              <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="15" r="10" fill="#10B981" stroke="#FFFFFF" stroke-width="3" opacity="0.9"/>
                <circle cx="15" cy="15" r="5" fill="#FFFFFF"/>
              </svg>
            `),
            iconSize: [30, 40],
            iconAnchor: [15, 40],
            popupAnchor: [0, -40],
          }) : null}
        >
          <Popup>
            <div className="text-sm font-semibold">Your Location</div>
          </Popup>
        </Marker>
      )}
      
      {/* Service range circle */}
      {userLocation && serviceRange > 0 && (
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={serviceRange * 1000} // Convert km to meters
          pathOptions={{
            color: '#3B82F6',
            fillColor: '#3B82F6',
            fillOpacity: 0.15,
            weight: 3,
            dashArray: '10, 10'
          }}
        />
      )}
      
      {/* Service provider markers */}
      {activeProviders
        .filter(provider => provider.position && provider.position.length === 2)
        .map((provider) => (
        <Marker
          key={provider.id}
          position={provider.position}
          icon={customIcon}
          eventHandlers={{
            click: () => {
              // Directly open the main modal when marker is clicked
              if (onProviderClick) {
                onProviderClick(provider.id);
              }
            }
          }}
        >
     
        </Marker>
      ))}
      </MapContainer>
    </div>
  );
}
