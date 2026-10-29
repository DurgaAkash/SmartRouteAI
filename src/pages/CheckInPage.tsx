import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Bus as BusIcon, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { User, Route, Bus, CheckIn } from '../types';

interface CheckInPageProps {
  currentUser: User | null;
  onNavigate: (tab: string) => void;
  onOpenLogin: (isAdmin: boolean) => void;
}

export const CheckInPage: React.FC<CheckInPageProps> = ({
  currentUser,
  onNavigate,
  onOpenLogin,
}) => {
  const [origin, setOrigin] = useState('Vel Tech Junction');
  const [destination, setDestination] = useState('Pattabiram');
  const [routeId, setRouteId] = useState('R-102');
  const [travelDate, setTravelDate] = useState('2026-10-28');
  const [travelTime, setTravelTime] = useState('08:30');
  const [passengerCount, setPassengerCount] = useState(1);
  const [selectedBusId, setSelectedBusId] = useState('TN-01-SR-102');

  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successRecord, setSuccessRecord] = useState<CheckIn | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getRoutes(), api.getBuses()]).then(([rData, bData]) => {
      setRoutes(rData);
      setBuses(bData);
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Please log in with your passenger account to submit travel check-ins.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessRecord(null);

    try {
      const res = await api.submitCheckIn({
        origin,
        destination,
        boardingStop: origin,
        destinationStop: destination,
        routeId,
        travelDate,
        travelTime,
        passengerCount,
        selectedBusId,
      });
      setSuccessRecord(res);
    } catch (err: any) {
      setError(err.message || 'Failed to submit check-in record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono mb-1">
          <Ticket className="w-4 h-4" />
          <span>Crowdsourced Rural Demand Ingestion</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Passenger Travel Request &amp; Check-In
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Submit your upcoming rural journey request. Saved directly into the database with status pending for dispatcher approval.
        </p>
      </div>

      {/* Auth Guard Banner if not logged in */}
      {!currentUser && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-amber-200">
              You must be logged in as a registered passenger to record travel requests and build verified demand histories.
            </p>
          </div>
          <button
            onClick={() => onOpenLogin(false)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shrink-0 transition-colors"
          >
            Sign In Now
          </button>
        </div>
      )}

      {/* Critical Operational Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Request Workflow:</strong> Submitting this form creates a database record with status <code>pending</code>. Dispatchers review and approve requests, assigning buses or scheduling additional trips. Your request status auto-refreshes in your Passenger Dashboard.
        </p>
      </div>

      {/* Success Modal / Banner */}
      {successRecord && (
        <div className="p-6 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl text-slate-200 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Travel Request Saved Successfully!</h3>
              <p className="text-xs text-emerald-300">
                Request ID: <span className="font-mono font-bold text-white">{successRecord.id}</span> &bull; Status: <span className="font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">{successRecord.status}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800 font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">CORRIDOR</span>
              <span className="text-white font-semibold">{successRecord.origin} ➔ {successRecord.destination}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">DATE &amp; TIME</span>
              <span className="text-white font-semibold">{successRecord.travelDate} @ {successRecord.travelTime}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">PASSENGERS</span>
              <span className="text-emerald-400 font-bold">{successRecord.passengerCount} Headcount</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">STATUS</span>
              <span className="text-amber-400 font-semibold uppercase">{successRecord.status}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              onClick={() => onNavigate('passenger-dashboard')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              Go to My Requests Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('travel-history')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
            >
              View Travel History
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Origin */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Origin Village / Stop *
            </label>
            <input
              type="text"
              required
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Vel Tech Junction"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              Destination Town / Hub *
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Pattabiram or Avadi Terminal"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Known Route Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Associated Transit Route (Optional)
            </label>
            <select
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- No specific route / General Feeder --</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id}: {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Bus */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <BusIcon className="w-3.5 h-3.5 text-sky-400" />
              Target Vehicle / Service (Optional)
            </label>
            <select
              value={selectedBusId}
              onChange={(e) => setSelectedBusId(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">-- Any Scheduled Fleet --</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} ({b.model} - {b.depot})
                </option>
              ))}
            </select>
          </div>

          {/* Travel Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Travel Date *
            </label>
            <input
              type="date"
              required
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Travel Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Expected Travel Time *
            </label>
            <input
              type="time"
              required
              value={travelTime}
              onChange={(e) => setTravelTime(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Passenger Count */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              Number of Passengers (Headcount) *
            </label>
            <input
              type="number"
              min={1}
              max={15}
              required
              value={passengerCount}
              onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Family, student group, or individual travelers</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
        >
          {submitting ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Ticket className="w-4 h-4" />
              Submit Passenger Check-In &amp; Update Demand
            </>
          )}
        </button>
      </form>
    </div>
  );
};
