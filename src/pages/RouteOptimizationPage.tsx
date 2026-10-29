import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Fuel, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Leaf,
  Layers
} from 'lucide-react';
import { api } from '../services/api';

export const RouteOptimizationPage: React.FC = () => {
  const [origin, setOrigin] = useState('Thiruvallur Collectorate');
  const [destination, setDestination] = useState('Avadi Bus Terminal');
  const [selectedVillages, setSelectedVillages] = useState<string[]>([
    'Kollumedu Panchayat',
    'Morai Rural Colony',
  ]);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleRunOptimizer();
  }, []);

  const handleRunOptimizer = async () => {
    setLoading(true);
    try {
      const res = await api.optimizeRoute({
        origin,
        destination,
        intermediateVillages: selectedVillages,
      });
      setOptimizationResult(res);
    } catch (err) {
      console.error('Optimization failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 font-mono mb-1">
          <Sliders className="w-4 h-4" />
          <span>Network Topology &amp; Bypass Optimizer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Rural Route Optimization &amp; Chokepoint Bypass
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Algorithmic path reconstruction prioritizing all-weather bitumen roads, healthcare connectivity, and fuel conservation.
        </p>
      </div>

      {/* Input Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Origin Node</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Hub</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Intermediate Rural Hamlets:</span>
            <span className="font-mono text-emerald-400 font-semibold">{selectedVillages.join(' & ')}</span>
          </div>

          <button
            onClick={handleRunOptimizer}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Compute Optimized Path
              </>
            )}
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      {optimizationResult && (
        <div className="space-y-6">
          {/* Key Savings Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Fuel className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400">Fuel Conservation</span>
                <p className="text-2xl font-black text-emerald-400 font-mono">
                  -{optimizationResult.optimizedRoute.fuelSavingsPct}%
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Saves ~18.5 L Diesel / week</p>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400">Travel Time Saved</span>
                <p className="text-2xl font-black text-sky-400 font-mono">
                  -18 mins
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Reduced from 64 to 46 mins</p>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400">CO2 Emissions Cut</span>
                <p className="text-2xl font-black text-teal-400 font-mono">
                  -{optimizationResult.optimizedRoute.carbonReductionKg} kg
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Direct tailpipe emission drop</p>
              </div>
            </div>
          </div>

          {/* Existing Route vs Optimized Route Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Existing Route */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Legacy Status Quo</span>
                  <h4 className="text-base font-bold text-slate-200">Existing Route Path</h4>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {optimizationResult.originalRoute.totalDistanceKm} km
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Duration:</span>
                  <span className="font-mono text-slate-200 font-bold">{optimizationResult.originalRoute.estimatedTimeMins} mins</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Road Quality:</span>
                  <span className="text-amber-400">{optimizationResult.originalRoute.roadCondition}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Traffic Bottlenecks:</span>
                  <span className="text-rose-400 font-semibold">{optimizationResult.originalRoute.congestionLevel}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 block mb-2">Waypoint Progression:</span>
                <div className="space-y-1.5 text-xs text-slate-400">
                  {optimizationResult.originalRoute.path.map((p: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-[10px]">
                        {i + 1}
                      </span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Proposed Optimized Route */}
            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">AI Recommended Path</span>
                  <h4 className="text-base font-bold text-white">Optimized Feeder Loop</h4>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {optimizationResult.optimizedRoute.totalDistanceKm} km (-6.4 km)
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Duration:</span>
                  <span className="font-mono text-emerald-400 font-bold">{optimizationResult.optimizedRoute.estimatedTimeMins} mins</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Road Quality:</span>
                  <span className="text-emerald-300">{optimizationResult.optimizedRoute.roadCondition}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Traffic Bottlenecks:</span>
                  <span className="text-emerald-400 font-semibold">{optimizationResult.optimizedRoute.congestionLevel}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 block mb-2">Benefit Drivers &amp; Rationale:</span>
                <ul className="space-y-2 text-xs text-slate-300">
                  {optimizationResult.optimizedRoute.benefitReasons.map((reason: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
