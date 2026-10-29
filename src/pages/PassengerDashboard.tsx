import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Bus, 
  Ticket, 
  Calendar, 
  History, 
  ArrowRight, 
  Bell, 
  Clock, 
  CheckCircle2, 
  Navigation,
  Compass,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  Check,
  XCircle,
  ShieldCheck,
  Send
} from 'lucide-react';
import { api } from '../services/api';
import { User, CheckIn, Schedule } from '../types';

interface PassengerDashboardProps {
  currentUser: User | null;
  onNavigate: (tab: string) => void;
  onOpenLogin: (isAdmin: boolean) => void;
}

export const PassengerDashboard: React.FC<PassengerDashboardProps> = ({
  currentUser,
  onNavigate,
  onOpenLogin,
}) => {
  const [requests, setRequests] = useState<CheckIn[]>([]);
  const [publishedSchedules, setPublishedSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const loadDashboardData = async () => {
    try {
      const [reqData, schData] = await Promise.all([
        api.getPassengerRequests(),
        api.getSchedules({ status: 'PUBLISHED' }),
      ]);
      setRequests(reqData);
      setPublishedSchedules(schData.slice(0, 5));
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load passenger dashboard data:', err);
    }
  };

  // Requirement: Automatically refresh the passenger dashboard every 10–15 seconds (using 12s)
  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      loadDashboardData().finally(() => setLoading(false));

      const interval = setInterval(() => {
        loadDashboardData();
      }, 12000);

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <LayoutDashboard className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Passenger Sign-In Required</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Please sign in to access your passenger dashboard, search routes, submit travel requests, and track approved bus dispatches.
        </p>
        <button
          onClick={() => onOpenLogin(false)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-colors"
        >
          Sign In as Passenger
        </button>
      </div>
    );
  }

  const approvedRequests = requests.filter((r) => r.status === 'approved');
  const pendingRequests = requests.filter((r) => r.status === 'pending' || r.status === 'TRAVEL_INTENTION');
  const rejectedRequests = requests.filter((r) => r.status === 'rejected');

  const filteredRequests = requests.filter((r) => {
    if (requestFilter === 'approved') return r.status === 'approved';
    if (requestFilter === 'pending') return r.status === 'pending' || r.status === 'TRAVEL_INTENTION';
    if (requestFilter === 'rejected') return r.status === 'rejected';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold uppercase">
                Passenger Portal
              </span>
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                Live Sync (12s): {lastRefreshed.toLocaleTimeString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {currentUser.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Submit your rural travel requests, inspect verified bus schedules, follow live GPS telematics, and track your approved journey allocations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('check-in')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-transform hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              Submit Travel Request
            </button>
            <button
              onClick={() => onNavigate('bus-tracking')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <Bus className="w-4 h-4 text-sky-400" />
              Live Bus Tracking
            </button>
            <button
              onClick={() => {
                setLoading(true);
                loadDashboardData().finally(() => setLoading(false));
              }}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-colors"
              title="Refresh dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => onNavigate('route-search')}
          className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 shadow-xl cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
            Dynamic Route Search
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Search journeys across India with interactive road geometries and official verified transit services.
          </p>
        </div>

        <div
          onClick={() => onNavigate('bus-tracking')}
          className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-5 shadow-xl cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <Bus className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
            Live Bus Tracking Map
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Filter vehicles by route, track coordinates, speed gauges, driver details, and distinguish real vs simulated GPS.
          </p>
        </div>

        <div
          onClick={() => onNavigate('check-in')}
          className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-5 shadow-xl cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Ticket className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
            Passenger Check-In &amp; Request
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Log your village departure to inform dispatcher capacity and request additional bus trips.
          </p>
        </div>
      </div>

      {/* ============================================================= */}
      {/* REQUIREMENT: APPROVED REQUESTS SECTION                        */}
      {/* ============================================================= */}
      <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">Approved Requests</h2>
              <p className="text-xs text-slate-400">
                Official travel requests verified by transport operations.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold self-start sm:self-auto">
            {approvedRequests.length} Approved Journey{approvedRequests.length === 1 ? '' : 's'}
          </span>
        </div>

        {approvedRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedRequests.map((req) => {
              const hasAssignment = Boolean(req.assignedBusRegNo || req.assignedBusId || req.assignedScheduleId);

              return (
                <div
                  key={req.id}
                  className={`p-5 rounded-2xl border transition-all text-xs space-y-4 ${
                    hasAssignment
                      ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                      : 'bg-slate-800/80 border-amber-500/40'
                  }`}
                >
                  {/* Top Status Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      ID: {req.id}
                    </span>

                    {hasAssignment ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                        <Check className="w-3 h-3" />
                        Schedule &amp; Bus Assigned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                        <Clock className="w-3 h-3" />
                        Approved – Awaiting Schedule Assignment
                      </span>
                    )}
                  </div>

                  {/* Body Details */}
                  {hasAssignment ? (
                    /* Requirement: If a bus or schedule has been assigned, display its route, bus number, boarding stop, departure time, and travel date */
                    <div className="space-y-3">
                      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase text-slate-500">Route / Corridor</span>
                          <span className="font-bold text-emerald-400 font-mono">
                            {req.assignedRouteId || req.routeId || 'Rural Connector'}
                          </span>
                        </div>
                        <p className="font-bold text-white text-sm">
                          {req.assignedRouteName || req.routeName || `${req.origin} ➔ ${req.destination}`}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 font-mono text-[11px]">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Bus Number</span>
                          <span className="text-white font-bold">{req.assignedBusRegNo || req.assignedBusId}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Boarding Stop</span>
                          <span className="text-sky-300 font-semibold truncate block">{req.boardingStop || req.origin}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Departure Time</span>
                          <span className="text-emerald-400 font-bold">{req.assignedDepartureTime || req.travelTime}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Travel Date</span>
                          <span className="text-white">{req.travelDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Passengers</span>
                          <span className="text-purple-300 font-semibold">{req.passengerCount} Pax</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Verified By</span>
                          <span className="text-slate-300 truncate block">{req.approvedBy || 'Operations'}</span>
                        </div>
                      </div>

                      {req.adminRemarks && (
                        <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          &ldquo;{req.adminRemarks}&rdquo;
                        </p>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => onNavigate('bus-tracking')}
                          className="px-3 py-1.5 bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-500/40 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Bus className="w-3.5 h-3.5" />
                          Track Assigned Bus on Map
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Requirement: If no schedule has been assigned, display "Approved – Awaiting Schedule Assignment" */
                    <div className="space-y-3">
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
                        <p className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                          Approved – Awaiting Schedule Assignment
                        </p>
                        <p className="text-[11px] text-amber-200/80 leading-relaxed">
                          Your rural travel request has been verified and approved by transport operations. Final fleet vehicle allocation and departure slot will be assigned shortly.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-slate-500 block text-[9px]">CORRIDOR</span>
                          <span className="text-white font-semibold">{req.origin} ➔ {req.destination}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">REQUESTED DATE &amp; TIME</span>
                          <span className="text-slate-200">{req.travelDate} @ {req.travelTime}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">BOARDING STOP</span>
                          <span className="text-sky-300">{req.boardingStop || req.origin}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">PASSENGERS</span>
                          <span className="text-purple-300 font-bold">{req.passengerCount} Pax</span>
                        </div>
                      </div>

                      {req.adminRemarks && (
                        <p className="text-[11px] text-slate-400 italic">
                          Note from Dispatcher: &ldquo;{req.adminRemarks}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <Ticket className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-300">No approved travel requests yet</p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              When transit dispatchers approve your submitted journeys, your allocated bus, departure slot, and schedule will appear here automatically.
            </p>
          </div>
        )}
      </div>

      {/* ============================================================= */}
      {/* REQUIREMENT: MY REQUESTS DASHBOARD SECTION                     */}
      {/* ============================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): My Requests List */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="text-base font-bold text-white">My Requests Dashboard</h2>
                <p className="text-xs text-slate-400">All submitted travel requests for {currentUser.name}</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl text-[11px] font-semibold">
              <button
                onClick={() => setRequestFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  requestFilter === 'all' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({requests.length})
              </button>
              <button
                onClick={() => setRequestFilter('approved')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  requestFilter === 'approved' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                Approved ({approvedRequests.length})
              </button>
              <button
                onClick={() => setRequestFilter('pending')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  requestFilter === 'pending' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                Pending ({pendingRequests.length})
              </button>
              {rejectedRequests.length > 0 && (
                <button
                  onClick={() => setRequestFilter('rejected')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    requestFilter === 'rejected' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-rose-300'
                  }`}
                >
                  Rejected ({rejectedRequests.length})
                </button>
              )}
            </div>
          </div>

          {filteredRequests.length > 0 ? (
            <div className="space-y-3">
              {filteredRequests.map((item) => {
                const isApproved = item.status === 'approved';
                const isRejected = item.status === 'rejected';

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-2 transition-all hover:border-slate-600"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded font-bold">
                          {item.id}
                        </span>
                        <span className="font-bold text-white text-sm">
                          {item.origin} ➔ {item.destination}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase self-start sm:self-auto ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isRejected
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {isApproved ? (
                          <Check className="w-3 h-3" />
                        ) : isRejected ? (
                          <XCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending Review'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 font-mono pt-1">
                      <div>
                        <span className="text-slate-500 block text-[9px]">TRAVEL DATE</span>
                        <span className="text-slate-200">{item.travelDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">TRAVEL TIME</span>
                        <span className="text-emerald-400 font-bold">{item.travelTime}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">PASSENGERS</span>
                        <span className="text-purple-300 font-semibold">{item.passengerCount} Pax</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">SCHEDULE</span>
                        <span className="text-sky-300">
                          {isApproved
                            ? item.assignedBusRegNo || 'Awaiting Assignment'
                            : isRejected
                            ? 'Cancelled'
                            : 'In Dispatch Queue'}
                        </span>
                      </div>
                    </div>

                    {isApproved && item.assignedBusRegNo && (
                      <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-300 border-t border-slate-700/50">
                        <span>Assigned Bus: <strong className="font-mono text-white">{item.assignedBusRegNo}</strong> ({item.assignedRouteName || item.routeName})</span>
                        <button
                          onClick={() => onNavigate('bus-tracking')}
                          className="text-sky-400 hover:underline font-semibold"
                        >
                          Track Now &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs space-y-3">
              <p>No requests found in this filter.</p>
              <button
                onClick={() => onNavigate('check-in')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors inline-block"
              >
                Submit New Travel Request
              </button>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Published Bus Timetables */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white">Active Timetables</h3>
            </div>
            <button
              onClick={() => onNavigate('schedules')}
              className="text-xs text-sky-400 hover:underline font-semibold"
            >
              Full Timetable &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {publishedSchedules.map((sch) => (
              <div key={sch.id} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{sch.routeName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {sch.origin} ➔ {sch.destination} &bull; Every {sch.frequencyMins}m
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-400 font-bold block">{sch.departureTime}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{sch.busId}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Data Protection Footer Note */}
          <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Passenger Data Isolation Active: Requests are strictly private to your account.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
