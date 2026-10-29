import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Clock, 
  Bus, 
  MapPin, 
  CheckCircle2, 
  FileSpreadsheet, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { Schedule, Route, PublicTransportService } from '../types';

export const BusSchedulePage: React.FC = () => {
  const [activeCatalog, setActiveCatalog] = useState<'verified' | 'local'>('verified');
  const [publicServices, setPublicServices] = useState<PublicTransportService[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  
  const [filterOperator, setFilterOperator] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getPublicTransportServices().catch(() => []),
      api.getSchedules(),
      api.getRoutes(),
    ])
      .then(([ptData, schData, routeData]) => {
        setPublicServices(ptData);
        setSchedules(schData);
        setRoutes(routeData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredPublic = publicServices.filter((s) => {
    if (filterOperator !== 'all' && !s.operatorName.toLowerCase().includes(filterOperator.toLowerCase())) return false;
    if (filterStatus !== 'all' && s.verificationStatus !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inStops = s.intermediateStops?.some((st) => st.stopName.toLowerCase().includes(q));
      return (
        s.operatorName.toLowerCase().includes(q) ||
        s.serviceNumber.toLowerCase().includes(q) ||
        s.busNumber.toLowerCase().includes(q) ||
        s.originStop.toLowerCase().includes(q) ||
        s.destinationStop.toLowerCase().includes(q) ||
        Boolean(inStops)
      );
    }
    return true;
  });

  const filteredLocal = schedules.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.routeName.toLowerCase().includes(q) ||
        s.origin.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q) ||
        s.busId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono mb-1">
            <Calendar className="w-4 h-4" />
            <span>Public Transit Schedule Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Bus Schedule &amp; Timetable Viewer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse verified public transport feeds (APSRTC in Andhra Pradesh, MTC, etc.) with operator attribution, intermediate stops, and last verified timestamps.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          Print / Export Timetable
        </button>
      </div>

      {/* Catalog Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveCatalog('verified')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeCatalog === 'verified'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Verified State Road Transport Services ({publicServices.length})
        </button>
        <button
          onClick={() => setActiveCatalog('local')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeCatalog === 'local'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Bus className="w-4 h-4 text-sky-400" />
          Local Feeder Timetables ({schedules.length})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={activeCatalog === 'verified' ? "Search by village (e.g. Khambhampadu, Tiruvuru), operator, or service number..." : "Search by route name, village, or bus number..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {activeCatalog === 'verified' && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterOperator}
              onChange={(e) => setFilterOperator(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Transit Operators</option>
              <option value="APSRTC">APSRTC (Andhra Pradesh)</option>
              <option value="MTC">MTC Chennai (Tamil Nadu)</option>
              <option value="TNSTC">TNSTC Villupuram</option>
              <option value="KSRTC">KSRTC (Demonstration)</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Verification Statuses</option>
              <option value="VERIFIED_OFFICIAL">Verified Official Services Only</option>
              <option value="SAMPLE_UNVERIFIED">Sample Data — Not Verified</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Catalog Rendering */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Loading public transit schedules...</p>
        </div>
      ) : activeCatalog === 'verified' ? (
        /* VERIFIED PUBLIC TRANSPORT SERVICES LIST */
        filteredPublic.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No public transport service found matching filter criteria</p>
            <p className="text-xs">Try searching a different village or resetting operator filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPublic.map((s) => {
              const isVerified = s.verificationStatus === 'VERIFIED_OFFICIAL';
              return (
                <div
                  key={s.id}
                  className={`bg-slate-900/90 border rounded-2xl p-5 shadow-xl transition-all hover:scale-[1.01] space-y-3.5 ${
                    isVerified ? 'border-slate-800 hover:border-emerald-500/40' : 'border-amber-500/30 bg-amber-950/10'
                  }`}
                >
                  {/* Card Header: Operator + Badge */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded font-black text-xs font-mono uppercase ${
                        s.operatorName.includes('APSRTC')
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : s.operatorName.includes('MTC')
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {s.operatorName}
                      </span>
                      <span className="text-xs font-mono font-bold text-white">{s.serviceNumber}</span>
                    </div>

                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isVerified
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {isVerified ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-amber-400" />}
                      {isVerified ? 'Verified Official' : 'Sample Data — Not Verified'}
                    </span>
                  </div>

                  {/* Route & Times */}
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{s.serviceType}</h3>
                    <p className="text-[11px] text-slate-400">{s.operatorDivision || s.operatorName}</p>
                  </div>

                  <div className="my-2 py-2 px-3 bg-slate-800/70 rounded-xl flex items-center justify-between text-xs">
                    <div className="text-left">
                      <span className="text-[9px] text-slate-400 block font-mono">ORIGIN DEP</span>
                      <span className="font-extrabold text-emerald-400 font-mono text-base">{s.departureTime}</span>
                      <span className="text-[11px] text-white font-medium block truncate max-w-[110px]">{s.originStop}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 mx-1" />
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 block font-mono">DEST ARR</span>
                      <span className="font-extrabold text-sky-400 font-mono text-base">{s.arrivalTime}</span>
                      <span className="text-[11px] text-white font-medium block truncate max-w-[110px]">{s.destinationStop}</span>
                    </div>
                  </div>

                  {/* Intermediate Stops */}
                  {s.intermediateStops && s.intermediateStops.length > 0 && (
                    <div className="text-[11px] text-slate-400">
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">Route Sequence:</span>
                      <p className="text-slate-300 truncate">
                        {s.intermediateStops.map((st) => st.stopName).join(' ➔ ')}
                      </p>
                    </div>
                  )}

                  {/* Metadata: Data Source & Last Verified Timestamp */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[10px] font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Source:</span>
                      <span className="text-slate-300 truncate max-w-[180px]">{s.dataSource}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Last Verified:</span>
                      <span className="text-emerald-400">{new Date(s.lastVerified).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* LOCAL FEEDER SCHEDULES */
        filteredLocal.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No local feeder schedules found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLocal.map((sch) => {
              const isPub = sch.status === 'PUBLISHED';
              return (
                <div
                  key={sch.id}
                  className={`bg-slate-900/90 border rounded-2xl p-5 shadow-xl transition-all hover:scale-[1.01] ${
                    isPub ? 'border-slate-800 hover:border-emerald-500/40' : 'border-amber-500/30 bg-amber-950/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {sch.id} &bull; {sch.routeId}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isPub
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {isPub ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {sch.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{sch.routeName}</h3>
                  
                  <div className="my-3 py-2 px-3 bg-slate-800/60 rounded-xl flex items-center justify-between text-xs">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block font-mono">DEP TIME</span>
                      <span className="font-extrabold text-emerald-400 font-mono text-base">{sch.departureTime}</span>
                      <span className="text-[11px] text-slate-300 block truncate max-w-[120px]">{sch.origin}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 mx-2" />
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">ARR TIME</span>
                      <span className="font-extrabold text-sky-400 font-mono text-base">{sch.arrivalTime}</span>
                      <span className="text-[11px] text-slate-300 block truncate max-w-[120px]">{sch.destination}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Operating Fleet:</span>
                      <span className="font-mono text-white font-semibold">{sch.busId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Frequency:</span>
                      <span className="text-slate-300">Every {sch.frequencyMins} mins</span>
                    </div>
                    {sch.approvedBy && (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span>Approved By:</span>
                        <span className="text-emerald-400 font-medium">{sch.approvedBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};
