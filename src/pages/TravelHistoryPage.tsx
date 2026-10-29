import React, { useState, useEffect } from 'react';
import { 
  History, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Bus, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { CheckIn, User } from '../types';

interface TravelHistoryPageProps {
  currentUser: User | null;
  onNavigate: (tab: string) => void;
  onOpenLogin: (isAdmin: boolean) => void;
}

export const TravelHistoryPage: React.FC<TravelHistoryPageProps> = ({
  currentUser,
  onNavigate,
  onOpenLogin,
}) => {
  const [records, setRecords] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await api.getCheckIns();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load check-ins', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchRecords();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <History className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Passenger Sign-In Required</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Please log into your passenger profile to review your submitted travel intentions and trip verification logs.
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono mb-1">
            <History className="w-4 h-4" />
            <span>Passenger Travel History</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Check-In &amp; Travel Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Logged check-ins for {currentUser.name} ({currentUser.email}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('check-in')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Check-In
          </button>
          <button
            onClick={fetchRecords}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-colors"
            title="Refresh records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Role-Based Data Isolation: Protected against cross-passenger record access.</span>
        </div>
        <span className="font-mono text-emerald-400 text-[11px]">{records.length} Submissions Logged</span>
      </div>

      {/* Records Table / List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Fetching personal travel records...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <History className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-200">No travel check-ins logged yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Log your upcoming village or college journey to assist our AI in allocating buses to your route.
          </p>
          <button
            onClick={() => onNavigate('check-in')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors inline-block"
          >
            Submit First Check-In
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((rec) => {
            const isBoarded = rec.status === 'VERIFIED_BOARDING';
            return (
              <div
                key={rec.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-800 text-[11px]">
                      {rec.id}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Submitted {new Date(rec.submittedAt).toLocaleDateString()} @ {new Date(rec.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wide uppercase ${
                      isBoarded
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                    }`}
                  >
                    {isBoarded ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {isBoarded ? 'Verified Bus Boarding' : 'Travel Intention Logged'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono mb-0.5">Journey Corridor</span>
                    <p className="font-bold text-white text-sm">
                      {rec.origin} ➔ {rec.destination}
                    </p>
                    {rec.routeName && (
                      <p className="text-[11px] text-slate-400 truncate">{rec.routeName}</p>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono mb-0.5">Travel Schedule</span>
                    <p className="font-semibold text-slate-200">
                      {rec.travelDate}
                    </p>
                    <p className="text-emerald-400 font-mono font-bold">{rec.travelTime}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono mb-0.5">Headcount</span>
                    <p className="font-semibold text-purple-300 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {rec.passengerCount} {rec.passengerCount === 1 ? 'Passenger' : 'Passengers'}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono mb-0.5">Vehicle Reference</span>
                    <p className="font-mono text-sky-400 font-semibold">
                      {rec.selectedBusId || 'Open Corridor'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
