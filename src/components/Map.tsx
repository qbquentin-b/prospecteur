"use client";
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Lead } from '../types/lead';

// Fix Leaflet's default icon path issues in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  center: [number, number];
  radiusKm: number;
  leads: Lead[];
  onCenterChange?: (lat: number, lng: number) => void;
}

export default function Map({ center, radiusKm, leads, onCenterChange }: MapProps) {
  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-sm border border-border-light dark:border-border-dark relative z-0">
      <MapContainer
        key={`${center[0]}-${center[1]}`} // Re-mount when center significantly changes via search
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Interactive center pin */}
        <Marker
          position={center}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              if (onCenterChange) {
                onCenterChange(position.lat, position.lng);
              }
            },
          }}
        >
          <Popup>Zone de recherche ({radiusKm}km)</Popup>
        </Marker>

        <Circle center={center} radius={radiusKm * 1000} pathOptions={{ color: '#e68c19', fillColor: '#e68c19', fillOpacity: 0.1 }} />
        {leads.map((lead) => {
          // Fallback if lead doesn't have lat/lng (for mock data where places API fails)
          const lat = lead.lat || center[0] + (Math.random() - 0.5) * (radiusKm / 111);
          const lng = lead.lng || center[1] + (Math.random() - 0.5) * (radiusKm / 111);
          return (
            <Marker key={lead.id} position={[lat, lng]}>
              <Popup>
                <div className="font-bold">{lead.name}</div>
                <div className="text-xs">{lead.address}</div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
