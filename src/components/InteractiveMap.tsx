import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RouteGeometry, GeocodedLocation } from '../types';

interface InteractiveMapProps {
  origin: GeocodedLocation | null;
  destination: GeocodedLocation | null;
  routeGeometry: RouteGeometry | null;
  className?: string;
  zoom?: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  origin,
  destination,
  routeGeometry,
  className = 'h-96 w-full rounded-xl overflow-hidden shadow-inner border border-slate-700/60',
  zoom = 12,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center around rural Thiruvallur / Chennai / Tamil Nadu corridor
      const initialLat = origin?.lat || 13.1438;
      const initialLng = origin?.lng || 80.0500;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([initialLat, initialLng], zoom);

      // OpenStreetMap Standard Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    // Clear previous markers & polylines
    layerGroup.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    // Origin Marker
    if (origin) {
      const originIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="background-color: #10b981; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34],
      });

      const marker = L.marker([origin.lat, origin.lng], { icon: originIcon })
        .bindPopup(`<strong>Origin:</strong> ${origin.name}<br/><span style="font-size: 11px; color: #64748b;">${origin.displayName}</span>`);
      layerGroup.addLayer(marker);
      bounds.push([origin.lat, origin.lng]);
    }

    // Destination Marker
    if (destination) {
      const destIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="background-color: #ef4444; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34],
      });

      const marker = L.marker([destination.lat, destination.lng], { icon: destIcon })
        .bindPopup(`<strong>Destination:</strong> ${destination.name}<br/><span style="font-size: 11px; color: #64748b;">${destination.displayName}</span>`);
      layerGroup.addLayer(marker);
      bounds.push([destination.lat, destination.lng]);
    }

    // Route Polyline
    if (routeGeometry && routeGeometry.coordinates.length > 0) {
      const latLngs = routeGeometry.coordinates.map((c) => [c[0], c[1]] as [number, number]);

      // Outer glow line
      const casing = L.polyline(latLngs, {
        color: '#0284c7',
        weight: 7,
        opacity: 0.5,
      });
      layerGroup.addLayer(casing);

      // Inner polyline
      const polyline = L.polyline(latLngs, {
        color: '#38bdf8',
        weight: 4,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).bindPopup(`<b>Road Route</b><br/>Distance: ${routeGeometry.distanceKm} km<br/>Est. Time: ${routeGeometry.durationMins} mins`);
      layerGroup.addLayer(polyline);

      latLngs.forEach((pt) => bounds.push(pt));
    }

    if (bounds.length > 1) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 14 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 13);
    }

    // Leaflet needs resize tick
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

  }, [origin, destination, routeGeometry, zoom]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      {routeGeometry && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 text-xs shadow-xl text-slate-200 pointer-events-none">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Distance</span>
              <span className="font-bold text-emerald-400 text-sm">{routeGeometry.distanceKm} km</span>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Est. Road Time</span>
              <span className="font-bold text-sky-400 text-sm">{routeGeometry.durationMins} mins</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
