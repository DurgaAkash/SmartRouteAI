import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  BarChart3, 
  Calendar, 
  Users, 
  Layers, 
  CheckCircle2, 
  Info 
} from 'lucide-react';
import { api } from '../services/api';

export const DemandAnalysisPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCorridor, setSelectedCorridor] = useState<string | null>(null);

  useEffect(() => {
    api.getDemandAnalytics().then((res) => {
      setData(res);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading || !data) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Computing passenger demand analytics across rural matrices...</p>
      </div>
    );
  }

  const maxHourlyPax = Math.max(...data.hourlyCurve.map((h: any) => h.passengers), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono mb-1">
          <TrendingUp className="w-4 h-4" />
          <span>Spatio-Temporal Demand Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Passenger Demand Analysis &amp; Bottleneck Identification
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Multi-dimensional breakdown of rural travel patterns across origin-destination pairs, diurnal hours, and underserved villages.
        </p>
      </div>

      {/* Dataset Labeling Notice per Prompt Section 7 */}
      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-3 text-xs text-slate-300 shadow-lg">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">Data Provenance &amp; Distinction</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Data visualized combines <strong>(1) Verified historical passenger ticketing counts</strong>, <strong>(2) Live crowdsourced passenger check-in intentions</strong>, and <strong>(3) Calibrated synthetic baseline patterns</strong> for student and market corridors.
          </p>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Morning Peak Window</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">07:00 - 09:30 AM</p>
          <p className="text-[11px] text-emerald-400 mt-1 font-mono">
            Peak Volume: ~155 Pax/hr (College &amp; Workers)
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Evening Peak Window</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">16:30 - 19:00 PM</p>
          <p className="text-[11px] text-amber-400 mt-1 font-mono">
            Return Influx: ~142 Pax/hr (Suburban &amp; Rural)
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Critical Underserved Hubs</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">3 Panchayats</p>
          <p className="text-[11px] text-rose-400 mt-1 font-mono">
            Kollumedu, Vellanur Western, Morai Hamlet
          </p>
        </div>
      </div>

      {/* Hourly Diurnal Curve (Pure SVG Interactive Chart) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Diurnal Passenger Volume Curve (24-Hour Profile)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies morning commuter spikes, afternoon lulls, and evening returns across all active rural lines.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Peak Period
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-slate-700 inline-block" /> Regular Base
            </span>
          </div>
        </div>

        {/* Responsive Bar Chart Rendering */}
        <div className="pt-6 pb-2">
          <div className="h-48 flex items-end gap-1.5 sm:gap-2.5 w-full">
            {data.hourlyCurve.map((h: any, i: number) => {
              const heightPct = Math.round((h.passengers / maxHourlyPax) * 100);
              const isPeak = h.isPeak;
              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-mono py-1 px-2 rounded border border-slate-700 pointer-events-none whitespace-nowrap z-20 shadow-lg">
                    {h.hour}: {h.passengers} Passengers
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-md transition-all duration-300 group-hover:brightness-125 ${
                      isPeak
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  />
                  <span className="text-[9px] font-mono text-slate-500 mt-2 truncate w-full text-center">
                    {h.hour.split(':')[0]}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-2 text-[11px] font-mono text-slate-400">
            Hour of Day (05:00 to 21:00 IST)
          </div>
        </div>
      </div>

      {/* Route Corridors Ranking & Underserved Village Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Corridor Rankings (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Rural Corridor Demand Rankings
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Capacity Load %</span>
          </div>

          <div className="space-y-3">
            {data.corridorRankings.map((c: any, idx: number) => {
              const isOver = c.loadPct > 85;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-2 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-emerald-400 font-bold text-[11px] mr-2">#{idx + 1}</span>
                      <span className="font-bold text-white">{c.corridor}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isOver
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Recorded Demand: <strong className="text-white font-mono">{c.demand} Pax</strong></span>
                    <span>Rural Intermediate Stops: <strong className="text-slate-300">{c.ruralStops}</strong></span>
                  </div>

                  {/* Progress Load Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-700/60 overflow-hidden">
                    <div
                      style={{ width: `${c.loadPct}%` }}
                      className={`h-full rounded-full ${
                        isOver ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Underserved Village Vulnerability Analysis (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Underserved Village Warnings
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              High Priority
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Locations where resident population, school walk distances, and low bus trip frequencies trigger rural isolation alerts.
          </p>

          <div className="space-y-3">
            {data.underservedVillages.map((v: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{v.name}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                    {v.riskScore} Risk
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
                  <div>Pop: <span className="text-white">{v.population}</span></div>
                  <div>Walk to Stop: <span className="text-amber-300 font-bold">{v.nearestStopKm} km</span></div>
                  <div>Daily Trips: <span className="text-white">{v.dailyTrips} buses/day</span></div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-emerald-300 font-medium">
                  Recommendation: {v.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
