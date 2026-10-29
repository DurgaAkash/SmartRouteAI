import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Bus, Route } from '../types';

interface BusTrackingMapProps {
  buses: Bus[];
  selectedBus: Bus | null;
  selectedRoute?: Route | null;
  onSelectBus: (bus: Bus) => void;
  className?: string;
}

export const BusTrackingMap: React.FC<BusTrackingMapProps> = ({
  buses,
  selectedBus,
  selectedRoute,
  onSelectBus,
  className = 'h-[520px] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const busMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = selectedBus ? selectedBus.currentLat : 13.155;
      const initialLng = selectedBus ? selectedBus.currentLng : 80.11;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([initialLat, initialLng], 12);

      // CartoDB Positron / OSM style
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const routeLayerGroup = L.layerGroup().addTo(map);
      routeLayerGroupRef.current = routeLayerGroup;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        busMarkersRef.current.clear();
      }
    };
  }, []);

  // Update Route Polyline & Stops
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeGroup = routeLayerGroupRef.current;
    if (!map || !routeGroup) return;

    routeGroup.clearLayers();

    if (selectedRoute && selectedRoute.stops && selectedRoute.stops.length > 0) {
      const latLngs: [number, number][] = selectedRoute.stops.map((s) => [s.lat, s.lng]);

      // Draw polyline connecting stops
      L.polyline(latLngs, {
        color: '#0284c7',
        weight: 4,
        opacity: 0.8,
        dashArray: '6, 8',
      }).addTo(routeGroup);

      // Draw stop markers
      selectedRoute.stops.forEach((stop) => {
        const stopIcon = L.divIcon({
          className: 'route-stop-pin',
          html: `
            <div style="
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: #0f172a;
              border: 2px solid ${stop.isRural ? '#10b981' : '#38bdf8'};
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: 800;
              box-shadow: 0 2px 8px rgba(0,0,0,0.5);
            ">
              ${stop.sequence}
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        L.marker([stop.lat, stop.lng], { icon: stopIcon })
          .bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
              <strong>Stop ${stop.sequence}: ${stop.stopName}</strong>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                ${stop.isRural ? 'Rural Stop / Hamlet' : 'Urban Transit Interchange'}
              </div>
            </div>
          `)
          .addTo(routeGroup);
      });

      // Fit map bounds to show route and its buses if we just switched routes
      if (buses.length > 0) {
        const allPoints: [number, number][] = [
          ...latLngs,
          ...buses.map((b) => [b.currentLat, b.currentLng] as [number, number]),
        ];
        try {
          const bounds = L.latLngBounds(allPoints);
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        } catch {
          // Fallback if points invalid
        }
      }
    }
  }, [selectedRoute]);

  // Update or create bus markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    buses.forEach((bus) => {
      const isSelected = selectedBus?.id === bus.id;
      const isMoving = bus.lastSpeedKmh > 5;
      const isSimulated = bus.isSimulatedGps;

      const bgColor = isSelected
        ? '#f59e0b'
        : isSimulated
        ? '#0284c7'
        : '#10b981';

      const busIcon = L.divIcon({
        className: 'bus-tracking-pin',
        html: `
          <div style="
            position: relative;
            background: ${bgColor};
            color: white;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 4px;
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            white-space: nowrap;
            transform: translate(-50%, -50%);
            cursor: pointer;
          ">
            <span style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: ${isSimulated ? '#f59e0b' : '#22c55e'};
              display: inline-block;
              box-shadow: 0 0 6px ${isSimulated ? '#f59e0b' : '#22c55e'};
            "></span>
            <span>🚌 ${bus.id.replace('TN-01-SR-', 'SR-')}</span>
            <span style="font-size: 9px; opacity: 0.9; font-family: monospace;">${bus.lastSpeedKmh}km/h</span>
            <span style="font-size: 8px; background: rgba(0,0,0,0.3); padding: 1px 3px; border-radius: 4px; text-transform: uppercase;">
              ${isSimulated ? 'SIM' : 'GPS'}
            </span>
          </div>
        `,
        iconSize: [100, 28],
        iconAnchor: [50, 14],
      });

      const existingMarker = busMarkersRef.current.get(bus.id);

      if (existingMarker) {
        existingMarker.setLatLng([bus.currentLat, bus.currentLng]);
        existingMarker.setIcon(busIcon);
      } else {
        const marker = L.marker([bus.currentLat, bus.currentLng], { icon: busIcon })
          .on('click', () => onSelectBus(bus))
          .bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
              <strong>${bus.regNo} (${bus.id})</strong>
              <div style="font-size: 11px; color: #475569; margin: 3px 0;">Model: ${bus.model}</div>
              <div style="font-size: 11px; color: #475569;">Route: ${bus.assignedRouteId} &bull; Depot: ${bus.depot}</div>
              <div style="font-size: 11px; font-weight: bold; margin-top: 4px; color: ${isSimulated ? '#d97706' : '#16a34a'};">
                ${isSimulated ? '⚠️ Demo Simulation Telematics' : '✅ Certified AIS-140 Real GPS Feed'}
              </div>
              <div style="font-size: 10px; font-family: monospace; color: #64748b; margin-top: 2px;">
                Lat: ${bus.currentLat.toFixed(5)}, Lng: ${bus.currentLng.toFixed(5)}
              </div>
            </div>
          `)
          .addTo(map);
        busMarkersRef.current.set(bus.id, marker);
      }
    });

    // Cleanup markers for removed or filtered-out buses
    busMarkersRef.current.forEach((marker, busId) => {
      if (!buses.some((b) => b.id === busId)) {
        marker.remove();
        busMarkersRef.current.delete(busId);
      }
    });

    // Pan to selected bus smoothly
    if (selectedBus) {
      map.panTo([selectedBus.currentLat, selectedBus.currentLng], { animate: true });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }, [buses, selectedBus, onSelectBus]);

  const hasSimulatedBuses = buses.some((b) => b.isSimulatedGps);
  const hasRealGpsBuses = buses.some((b) => !b.isSimulatedGps);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating GPS Telemetry Mode Label Banner */}
      <div className="absolute top-3 left-3 z-[1000] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl px-3.5 py-2 shadow-2xl flex items-center gap-3 max-w-sm">
        <span
          className={`w-3 h-3 rounded-full shrink-0 ${
            hasRealGpsBuses && !hasSimulatedBuses
              ? 'bg-emerald-400 animate-ping'
              : 'bg-amber-400 animate-pulse'
          }`}
        />
        <div className="space-y-0.5">
          <p className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span>Telematics Feed Status:</span>
            {hasRealGpsBuses && !hasSimulatedBuses ? (
              <span className="text-emerald-400">Certified AIS-140 Live GPS</span>
            ) : hasRealGpsBuses && hasSimulatedBuses ? (
              <span className="text-sky-400">Mixed Mode (Real GPS + Demo SIM)</span>
            ) : (
              <span className="text-amber-300">Simulated Demo Telematics</span>
            )}
          </p>
          <p className="text-[10px] text-slate-400 leading-tight">
            {hasRealGpsBuses && !hasSimulatedBuses
              ? 'Receiving verified real-time coordinates from onboard vehicle GPS units.'
              : 'Synthetic position data progressing along verified route geometry. Real AIS-140 device webhook ready.'}
          </p>
        </div>
      </div>
    </div>
  );
};

