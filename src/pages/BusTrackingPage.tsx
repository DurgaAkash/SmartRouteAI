import React, { useState, useEffect, useRef } from 'react';
import { 
  Bus as BusIcon, 
  MapPin, 
  Gauge, 
  Clock, 
  Phone, 
  User, 
  Radio, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2,
  Navigation,
  Compass,
  Filter,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { Bus, Route } from '../types';
import { BusTrackingMap } from '../components/BusTrackingMap';

export const BusTrackingPage: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('all');
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [togglingGps, setTogglingGps] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date>(new Date());

  // Ref to track latest selectedBus across asynchronous intervals
  const selectedBusRef = useRef<Bus | null>(selectedBus);
  useEffect(() => {
    selectedBusRef.current = selectedBus;
  }, [selectedBus]);

  // Fetch routes on mount
  useEffect(() => {
    api.getRoutes()
      .then((data) => {
        setRoutes(data);
      })
      .catch((err) => console.error('Failed to load routes:', err));
  }, []);

  // Fetch buses according to the selected route
  const fetchBusesForRoute = async (routeId: string = selectedRouteId, forceSelectFirst = false) => {
    try {
      const params = routeId !== 'all' ? { routeId } : undefined;
      const data = await api.getBuses(params);
      setBuses(data);
      setLastFetchedAt(new Date());

      const current = selectedBusRef.current;
      if (!forceSelectFirst && current) {
        const updated = data.find((b) => b.id === current.id);
        if (updated) {
          setSelectedBus(updated);
        } else if (data.length > 0) {
          setSelectedBus(data[0]);
        } else {
          setSelectedBus(null);
        }
      } else if (data.length > 0) {
        setSelectedBus(data[0]);
      } else {
        setSelectedBus(null);
      }
    } catch (err) {
      console.error('Failed to fetch buses:', err);
    }
  };

  // Re-fetch whenever selected route changes
  useEffect(() => {
    setLoading(true);
    fetchBusesForRoute(selectedRouteId, true).finally(() => setLoading(false));
  }, [selectedRouteId]);

  // Refresh tracking data every 6 seconds (within the 5–10s range)
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchBusesForRoute(selectedRouteId, false);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedRouteId]);

  // Manual GPS Mode Toggle (Demonstrating certified AIS-140 hardware ingestion vs demo simulation)
  const handleToggleGpsMode = async () => {
    if (!selectedBus) return;
    setTogglingGps(true);
    try {
      const updated = await api.toggleBusGpsMode(selectedBus.id);
      setSelectedBus(updated);
      setBuses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } catch (err: any) {
      alert('Failed to toggle GPS telematics mode: ' + err.message);
    } finally {
      setTogglingGps(false);
    }
  };

  const selectedRoute = routes.find((r) => r.id === (selectedRouteId !== 'all' ? selectedRouteId : selectedBus?.assignedRouteId));
  const assignedRouteForBus = routes.find((r) => r.id === selectedBus?.assignedRouteId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono mb-1">
            <Radio className="w-4 h-4 animate-pulse text-sky-400" />
            <span>Dynamic Vehicle Telematics &amp; GPS Interface</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Live Rural Bus Tracking Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time coordinates, speed telemetry, and arrival predictions with dynamic route filtering.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            Synced: <span className="text-white font-bold">{lastFetchedAt.toLocaleTimeString()}</span>
          </div>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              autoRefresh
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            {autoRefresh ? 'Live Polling Active (6s)' : 'Polling Paused'}
          </button>

          <button
            onClick={() => {
              setLoading(true);
              fetchBusesForRoute(selectedRouteId, false).finally(() => setLoading(false));
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh now"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Route Selection Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <label htmlFor="route-selector" className="block text-xs font-bold text-white uppercase tracking-wider font-mono">
              Filter by Transit Corridor / Route
            </label>
            <p className="text-[11px] text-slate-400">
              Select a route to display only the buses operating on that corridor and view route geometry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 min-w-[280px] sm:min-w-[360px]">
          <select
            id="route-selector"
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 hover:border-sky-500 text-white font-semibold text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer"
          >
            <option value="all">🌐 All Transit Corridors &amp; Routes ({routes.length} Available)</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.id}: {route.name} ({route.origin} ➔ {route.destination})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mandatory Prototype Transparency Notice */}
      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-300">
            Hardware &amp; GPS Mode Transparency Notice
          </p>
          <p className="text-[11px] text-amber-200/80 leading-relaxed">
            In accordance with project guidelines, this tracking system clearly distinguishes between <strong>Real-time Certified GPS (AIS-140)</strong> and <strong>Simulated Demo Telematics</strong>. Buses tagged with <em>SIM</em> are updated dynamically along verified route geometries; buses tagged with <em>GPS</em> stream certified telematics. Use the inspector toggle to simulate onboard AIS-140 hardware ingestion.
          </p>
        </div>
      </div>

      {/* Main Map + Fleet Inspection Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Map (8 cols) */}
        <div className="lg:col-span-8">
          <BusTrackingMap
            buses={buses}
            selectedBus={selectedBus}
            selectedRoute={selectedRoute}
            onSelectBus={(bus) => setSelectedBus(bus)}
            className="h-[520px] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
          />

          {/* Quick Fleet Carousel below map */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
              <span>Buses On Route ({buses.length})</span>
              <span>Click a bus to inspect telemetry</span>
            </div>

            {buses.length > 0 ? (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {buses.map((bus) => (
                  <button
                    key={bus.id}
                    onClick={() => setSelectedBus(bus)}
                    className={`px-3.5 py-2.5 rounded-xl text-left border shrink-0 transition-all text-xs ${
                      selectedBus?.id === bus.id
                        ? 'bg-sky-500/20 border-sky-400 text-white shadow-lg shadow-sky-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${bus.isSimulatedGps ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                      <span className="font-bold font-mono text-white">{bus.id}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                          bus.isSimulatedGps
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {bus.isSimulatedGps ? 'DEMO SIM' : 'REAL GPS'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 mt-1">
                      <span>{bus.regNo}</span>
                      <span className="font-mono font-semibold text-slate-300">{bus.lastSpeedKmh} km/h</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                No active buses found for the selected corridor ({selectedRouteId}). Select another route or switch to "All Transit Corridors".
              </div>
            )}
          </div>
        </div>

        {/* Right Telemetry Details Drawer (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedBus ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 uppercase font-semibold">
                      {selectedBus.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        selectedBus.isSimulatedGps
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {selectedBus.isSimulatedGps ? 'Simulated Telematics' : 'AIS-140 Real GPS'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1.5">{selectedBus.regNo}</h3>
                  <p className="text-xs text-slate-400">{selectedBus.model}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {selectedBus.status}
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Updated {new Date(selectedBus.lastUpdated).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Gauges & Speed */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Current Speed</span>
                  </div>
                  <p className="text-2xl font-black font-mono text-white">
                    {selectedBus.lastSpeedKmh} <span className="text-xs font-normal text-slate-400">km/h</span>
                  </p>
                </div>

                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <BusIcon className="w-3.5 h-3.5 text-sky-400" />
                    <span>Seating Capacity</span>
                  </div>
                  <p className="text-2xl font-black font-mono text-white">
                    {selectedBus.capacity} <span className="text-xs font-normal text-slate-400">Seats</span>
                  </p>
                </div>
              </div>

              {/* Assigned Route Info */}
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Assigned Route</span>
                  <span className="font-bold text-emerald-400 font-mono">{selectedBus.assignedRouteId}</span>
                </div>
                <p className="font-semibold text-white">
                  {assignedRouteForBus ? assignedRouteForBus.name : 'Corridor Feeder Line'}
                </p>
                {assignedRouteForBus && (
                  <p className="text-[11px] text-slate-400">
                    {assignedRouteForBus.origin} ➔ {assignedRouteForBus.destination} &bull; {assignedRouteForBus.distanceKm} km
                  </p>
                )}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
                  <span>Depot: {selectedBus.depot}</span>
                  <span className="text-emerald-400">Normal Headway</span>
                </div>
              </div>

              {/* Live Coordinates Inspection */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bus ID:</span>
                  <span className="text-white font-bold">{selectedBus.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Latitude:</span>
                  <span className="text-sky-300 font-bold">{selectedBus.currentLat.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Longitude:</span>
                  <span className="text-sky-300 font-bold">{selectedBus.currentLng.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source:</span>
                  <span className={selectedBus.isSimulatedGps ? 'text-amber-400' : 'text-emerald-400 font-semibold'}>
                    {selectedBus.gpsSource || (selectedBus.isSimulatedGps ? 'Simulated Telematics' : 'Certified Real GPS')}
                  </span>
                </div>
              </div>

              {/* Hardware Telematics Mode Toggle (Demo requirement test tool) */}
              <div className="pt-1">
                <button
                  onClick={handleToggleGpsMode}
                  disabled={togglingGps}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                    selectedBus.isSimulatedGps
                      ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border-amber-500/40'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  {togglingGps ? (
                    'Switching Telematics Mode...'
                  ) : selectedBus.isSimulatedGps ? (
                    'Switch to Real GPS (Simulate Hardware Device)'
                  ) : (
                    'Switch to Demo Simulation Mode'
                  )}
                </button>
                <p className="text-[10px] text-slate-500 text-center mt-1">
                  Tests dynamic distinction between certified AIS-140 feed and demo simulation.
                </p>
              </div>

              {/* Crew Details */}
              <div className="space-y-2 text-xs">
                <span className="text-slate-400 font-semibold block text-[11px] uppercase font-mono">Assigned Crew</span>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="font-semibold text-white">{selectedBus.driverName}</p>
                      <p className="text-[10px] text-slate-400">Primary Pilot</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${selectedBus.driverPhone}`}
                    className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              <BusIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs">Select a bus on the map or carousel to inspect its real-time telematics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
