"use client";
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngBounds } from 'leaflet';
import { Lead } from '../types/lead';

// Fix Leaflet's default icon path issues in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export type ScannedGrid = {
  bounds: LatLngBounds;
  timestamp: number;
};

interface MapProps {
  center: [number, number];
  leads: Lead[];
  onGridScanRequest: (bounds: LatLngBounds) => void;
  scannedGrids: ScannedGrid[];
}

function MapEvents({ onCenterChange }: { onCenterChange: (center: L.LatLng) => void }) {
  const map = useMapEvents({
    moveend: () => {
      onCenterChange(map.getCenter());
    }
  });

  useEffect(() => {
    // Initial trigger
    onCenterChange(map.getCenter());
  }, [map, onCenterChange]);

  return null;
}

export default function Map({ center, leads, onGridScanRequest, scannedGrids }: MapProps) {
  const [dynamicCenter, setDynamicCenter] = useState<L.LatLng | null>(null);

  // When users double click on the center, they trigger a scan for the *current viewport bounds*
  // Or we can draw a visible 1km x 1km grid at the center. Let's do a central rectangle that they can scan.
  const GRID_SIZE_KM = 2;

  // Calculate a square around the current dynamic center (from panning) or the initial center.
  const activeCenter = dynamicCenter ? [dynamicCenter.lat, dynamicCenter.lng] : center;
  const latOffset = (GRID_SIZE_KM / 2) / 111;
  const lngOffset = (GRID_SIZE_KM / 2) / (111 * Math.cos(activeCenter[0] * (Math.PI / 180)));

  const targetBounds = new L.LatLngBounds(
    [activeCenter[0] - latOffset, activeCenter[1] - lngOffset],
    [activeCenter[0] + latOffset, activeCenter[1] + lngOffset]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between bg-surface-light dark:bg-surface-dark p-3 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">grid_on</span>
          <span className="text-sm font-semibold">Mode Quadrillage Dynamique</span>
        </div>
        <button
          onClick={() => {
            if (window.confirm(`Vous allez scanner la zone rectangulaire centrale (${GRID_SIZE_KM}x${GRID_SIZE_KM}km). Cela consommera des tokens. Continuer ?`)) {
              onGridScanRequest(targetBounds);
            }
          }}
          className="flex items-center gap-1 bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">radar</span>
          Scanner ce carré
        </button>
      </div>

      <div className="h-[450px] w-full rounded-xl overflow-hidden shadow-sm border border-border-light dark:border-border-dark relative z-0">
        <MapContainer
          key={`${center[0]}-${center[1]}-init`} // Only remount when the whole location text changes
          center={center}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapEvents onCenterChange={(c) => setDynamicCenter(c)} />

          {/* The targeting square in the center of the current view (or center prop) */}
          <Rectangle
            bounds={targetBounds}
            pathOptions={{ color: '#e68c19', weight: 3, fillOpacity: 0.1, dashArray: '5, 5' }}
          />

          {/* History of scanned grids */}
          {scannedGrids.map((grid, idx) => (
            <Rectangle
              key={`grid-${idx}`}
              bounds={grid.bounds}
              pathOptions={{ color: '#64748b', weight: 1, fillColor: '#cbd5e1', fillOpacity: 0.3 }}
            >
              <Popup>Scanné le {new Date(grid.timestamp).toLocaleDateString()}</Popup>
            </Rectangle>
          ))}

          {leads.map((lead) => {
            if (!lead.lat || !lead.lng) return null;
            return (
              <Marker key={lead.id} position={[lead.lat, lead.lng]}>
                <Popup>
                  <div className="font-bold">{lead.name}</div>
                  <div className="text-xs">{lead.address}</div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
