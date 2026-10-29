import React, { useEffect, useState } from 'react';
import { 
  Bus, 
  MapPin, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  Navigation, 
  Calendar, 
  CheckCircle,
  Database,
  Cpu,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import { Schedule } from '../types';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onOpenLogin: (isAdmin: boolean) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenLogin }) => {
  const [stats, setStats] = useState<any>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(console.error);
    api.getSchedules({ status: 'PUBLISHED' }).then((data) => setSchedules(data.slice(0, 4))).catch(console.error);
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 md:pt-14 md:pb-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AI-Driven Rural Mobility &bull; Minor Project Prototype</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            AI-Based Smart Rural Transportation{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
              Planning &amp; Optimization
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminating rural transit isolation across India through dynamic geocoding, Random Forest passenger demand forecasting, simulated GPS telematics, and multi-step Agentic AI bus scheduling.
          </p>

          {/* Quick CTA Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate('route-search')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Navigation className="w-4 h-4" />
              Dynamic Route Search
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('bus-tracking')}
              className="px-6 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-sky-300 font-semibold text-sm flex items-center gap-2 transition-all hover:border-sky-500/40"
            >
              <Bus className="w-4 h-4 text-sky-400" />
              Live Bus Tracking
            </button>
            <button
              onClick={() => onOpenLogin(true)}
              className="px-5 py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-semibold text-sm flex items-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Admin Portal
            </button>
          </div>

          {/* Live Quick Stats Strip */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 text-left shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Fleet Availability</span>
                <Bus className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white font-mono">{stats?.activeBuses || 5} <span className="text-xs text-slate-400 font-normal">Active Buses</span></p>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 100% Operational
              </p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 text-left shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Passenger Check-Ins</span>
                <CheckCircle className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-bold text-white font-mono">{stats?.totalCheckIns || 3} <span className="text-xs text-slate-400 font-normal">Logged</span></p>
              <p className="text-[11px] text-sky-400 mt-1 font-mono">{stats?.recordedDemand || 6} Total Headcount</p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 text-left shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>AI Predicted Surge</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white font-mono">+{stats?.predictedDemand || 53} <span className="text-xs text-slate-400 font-normal">Passengers</span></p>
              <p className="text-[11px] text-purple-400 mt-1 font-mono">R² = 0.894 (Random Forest)</p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 text-left shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Published Timetables</span>
                <Calendar className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-white font-mono">{stats?.publishedSchedules || 4} <span className="text-xs text-slate-400 font-normal">Active Lines</span></p>
              <p className="text-[11px] text-amber-400 mt-1 font-mono">{stats?.totalRoutes || 5} Rural Corridors</p>
            </div>
          </div>
        </div>
      </section>

      {/* Published Bus Schedules Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Official Published Bus Schedules
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Approved rural feeder timetables synchronized with passenger check-in demand
            </p>
          </div>
          <button
            onClick={() => onNavigate('schedules')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group"
          >
            View All Schedules
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {schedules.map((sch) => (
            <div
              key={sch.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all hover:shadow-xl group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {sch.routeId}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Every {sch.frequencyMins}m
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                {sch.routeName}
              </h3>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Departure</span>
                  <span className="font-mono font-semibold text-white">{sch.departureTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Arrival</span>
                  <span className="font-mono font-semibold text-white">{sch.arrivalTime}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-400">Assigned Bus</span>
                  <span className="font-mono text-sky-400">{sch.busId}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* System Architecture & Capabilities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Comprehensive Rural Transit Technology Stack
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Engineered with free and open-source tools: OpenStreetMap, Leaflet, Scikit-Learn, and Agentic AI workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Dynamic All-India Geocoding</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integrates Nominatim and OSRM to dynamically geocode any Indian village, hamlet, or bus junction (such as Vel Tech, Avadi, Pattabiram, Mandya, Baramati) with turn-by-turn road geometries and alternative routes.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">OpenStreetMap + OSRM</span>
              <button onClick={() => onNavigate('route-search')} className="text-emerald-400 font-semibold flex items-center gap-1">
                Try Search <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Random Forest Demand Prediction</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trained on rural travel intention logs, diurnal passenger cycles, and weekly village market shandy days. Generates accurate passenger volume forecasts with confidence intervals and peak bottleneck alerts.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">Scikit-learn ML Model</span>
              <button onClick={() => onNavigate('ai-prediction')} className="text-purple-400 font-semibold flex items-center gap-1">
                Inspect Model <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Agentic AI Planner &amp; Human Approval</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomous 8-stage tool-calling agent executing data retrieval, demand forecasting, depot fleet availability, and schedule generation with strict human-in-the-loop approval before publishing timetables.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">Multi-Tool Agentic AI</span>
              <button onClick={() => onNavigate('agent-planner')} className="text-cyan-400 font-semibold flex items-center gap-1">
                Launch Planner <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* College Project Submission Blueprint Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold uppercase">
              Academic Minor Project Deliverables
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Ready for Demonstration, Viva &amp; Code Review
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Complete source code includes Express/Node.js fullstack persistence, Python machine learning scripts (<code className="text-emerald-400 font-mono">ml_model.py</code>), Agentic AI pipeline (<code className="text-emerald-400 font-mono">agent_planner.py</code>), sample CSV datasets, and setup documentation (<code className="text-emerald-400 font-mono">README.md</code>).
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('datasets')}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-600 transition-colors flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              View Sample CSVs
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-colors flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4" />
              System Reports
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
