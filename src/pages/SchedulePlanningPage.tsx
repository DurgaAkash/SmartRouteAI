import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Bus, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Plus, 
  Trash2, 
  UploadCloud, 
  Sparkles,
  Sliders,
  ArrowRight,
  RefreshCw,
  Check,
  X,
  History,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { Schedule, Route, Bus as BusType, SchedulePlanVersion, PlannedTrip } from '../types';

export const SchedulePlanningPage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<BusType[]>([]);
  const [schedulePlans, setSchedulePlans] = useState<SchedulePlanVersion[]>([]);
  const [activePlan, setActivePlan] = useState<SchedulePlanVersion | null>(null);

  // Generator inputs
  const [fleetCount, setFleetCount] = useState<number>(5);
  const [turnaroundMins, setTurnaroundMins] = useState<number>(15);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // Manual Schedule Creation modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRouteId, setNewRouteId] = useState('R-106');
  const [newBusId, setNewBusId] = useState('TN-01-SR-101');
  const [newDepTime, setNewDepTime] = useState('09:30');
  const [newArrTime, setNewArrTime] = useState('10:18');
  const [newFreq, setNewFreq] = useState(30);

  const loadData = async () => {
    try {
      const [schData, routeData, busData, planData] = await Promise.all([
        api.getSchedules(),
        api.getRoutes(),
        api.getBuses(),
        api.getSchedulePlans().catch(() => []),
      ]);
      setSchedules(schData);
      setRoutes(routeData);
      setBuses(busData);
      setSchedulePlans(planData);
      if (planData.length > 0 && !activePlan) {
        setActivePlan(planData[0]);
      }
    } catch (err) {
      console.error('Error loading schedule planning data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateTimetable = async () => {
    setLoading(true);
    try {
      const plan = await api.generateOptimizedSchedule({
        availableBuses: fleetCount,
        turnaroundMins,
      });
      setActivePlan(plan);
      const [freshPlans, freshSchedules] = await Promise.all([
        api.getSchedulePlans(),
        api.getSchedules(),
      ]);
      setSchedulePlans(freshPlans);
      setSchedules(freshSchedules);
    } catch (err: any) {
      alert('Failed generating timetable: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanAction = async (action: 'APPROVE' | 'MODIFY' | 'REJECT') => {
    if (!activePlan) return;
    setActionLoading(true);
    try {
      const updated = await api.actionSchedulePlan({
        versionId: activePlan.versionId,
        action,
      });
      setActivePlan(updated);
      const [freshPlans, freshSchedules] = await Promise.all([
        api.getSchedulePlans(),
        api.getSchedules(),
      ]);
      setSchedulePlans(freshPlans);
      setSchedules(freshSchedules);
      if (action === 'APPROVE') {
        alert(`Plan ${updated.versionId} approved and synchronized to published passenger timetable!`);
      }
    } catch (err: any) {
      alert(`Action failed: ` + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishSchedule = async (id: string) => {
    setPublishingId(id);
    try {
      await api.publishSchedule(id);
      await loadData();
    } catch (err) {
      console.error('Publish error:', err);
    } finally {
      setPublishingId(null);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this schedule?')) return;
    try {
      await api.deleteSchedule(id);
      await loadData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSchedule({
        routeId: newRouteId,
        busId: newBusId,
        departureTime: newDepTime,
        arrivalTime: newArrTime,
        frequencyMins: newFreq,
        status: 'PROPOSED',
      });
      setShowCreateModal(false);
      await loadData();
    } catch (err) {
      console.error('Create error:', err);
    }
  };

  const diff = activePlan?.diff;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono mb-1">
            <Clock className="w-4 h-4" />
            <span>Timetable Synthesis &amp; Dispatch Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Bus Schedule Planning &amp; Optimization
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Synthesize balanced departure slots avoiding driver fatigue, vehicle idle times, and passenger overcrowding across all corridors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Custom Slot
          </button>

          <button
            onClick={handleGenerateTimetable}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Optimizing Full Fleet...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Optimized Schedule</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Timetable Generator Parameter Console */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            Dynamic Multi-Corridor Headway Synthesizer
          </h3>
          <span className="text-[10px] font-mono text-emerald-400">Demand Responsive Algorithm</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Available Road-Worthy Fleet: <strong className="text-sky-400">{fleetCount} Buses</strong>
            </label>
            <input
              type="range"
              min={1}
              max={buses.length || 6}
              value={fleetCount}
              onChange={(e) => setFleetCount(parseInt(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer mt-2"
            />
            <p className="text-[10px] text-slate-500 mt-1">Total active registered depot vehicles: {buses.length}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Driver Turnaround Buffer: <strong className="text-emerald-400">{turnaroundMins} mins</strong>
            </label>
            <input
              type="range"
              min={10}
              max={30}
              step={5}
              value={turnaroundMins}
              onChange={(e) => setTurnaroundMins(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer mt-2"
            />
            <p className="text-[10px] text-slate-500 mt-1">Mandatory layover between consecutive trips for maintenance &amp; boarding</p>
          </div>
        </div>
      </div>

      {/* Generated Plan & Difference Engine (Requirement 5 & 7) */}
      {activePlan && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  {activePlan.versionId}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  activePlan.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                  activePlan.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {activePlan.status}
                </span>
                <h3 className="text-base font-bold text-white">Algorithmic Timetable Version</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Generated: {new Date(activePlan.generatedAt).toLocaleString()} &bull; Headway: Every 35-45m &bull; Fleet Utilization: {activePlan.metrics.fleetUtilizationPct}%
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={activePlan.versionId}
                onChange={(e) => {
                  const selected = schedulePlans.find(p => p.versionId === e.target.value);
                  if (selected) setActivePlan(selected);
                }}
                className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 font-mono"
              >
                {schedulePlans.map(p => (
                  <option key={p.versionId} value={p.versionId}>
                    {p.versionId} ({p.status})
                  </option>
                ))}
              </select>

              {activePlan.status !== 'APPROVED' && (
                <button
                  onClick={() => handlePlanAction('APPROVE')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve Proposal
                </button>
              )}
            </div>
          </div>

          {/* Diff Box (Requirement 5) */}
          {diff && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-sky-400" />
                  Transition Summary from Previous Timetable:
                </span>
                {diff.previousVersionId && <span className="font-mono text-slate-500">Ref: {diff.previousVersionId}</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                  <span className="font-bold text-emerald-300 block mb-1">Added Trips ({diff.addedTrips.length})</span>
                  <div className="text-[11px] text-slate-300 space-y-1">
                    {diff.addedTrips.slice(0, 3).map(t => (
                      <p key={t.tripId} className="truncate">&bull; {t.routeName} ({t.departureTime})</p>
                    ))}
                    {diff.addedTrips.length === 0 && <p className="text-slate-500 italic">No added trips</p>}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
                  <span className="font-bold text-amber-300 block mb-1">Reduced / Omitted ({diff.removedTrips.length})</span>
                  <div className="text-[11px] text-slate-300 space-y-1">
                    {diff.removedTrips.slice(0, 3).map(t => (
                      <p key={t.tripId} className="truncate">&bull; {t.routeName} ({t.departureTime})</p>
                    ))}
                    {diff.removedTrips.length === 0 && <p className="text-slate-500 italic">No omitted trips</p>}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-500/30">
                  <span className="font-bold text-sky-300 block mb-1">Modified Timing ({diff.modifiedTrips.length})</span>
                  <div className="text-[11px] text-slate-300 space-y-1">
                    {diff.modifiedTrips.slice(0, 3).map((t, i) => (
                      <p key={i} className="truncate">&bull; {t.routeName}: {t.oldDetails.departureTime} ➔ {t.newDetails.departureTime}</p>
                    ))}
                    {diff.modifiedTrips.length === 0 && <p className="text-slate-500 italic">Slot timing maintained</p>}
                  </div>
                </div>
              </div>

              {diff.changeReasons.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 space-y-1">
                  <span className="font-bold text-white block">Algorithmic Justification:</span>
                  <ul className="pl-4 list-disc space-y-0.5">
                    {diff.changeReasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Generated Trips Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activePlan.trips.map((trip) => (
              <div key={trip.tripId} className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-2">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-white truncate max-w-[150px]">{trip.routeName}</span>
                  <span className="text-sky-400 font-bold">{trip.busRegNo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Departure:</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">{trip.departureTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Arrival:</span>
                  <span className="font-mono text-sky-400 font-bold text-sm">{trip.arrivalTime}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Occupancy: {trip.expectedPassengers} / {trip.allocatedCapacity}</span>
                  <span className="text-emerald-400 font-semibold">{trip.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Database Published Schedules */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Active System Schedules &amp; Passenger Timetable</h3>
            <p className="text-xs text-slate-400">Only published schedules are visible on the passenger portal.</p>
          </div>
          <span className="text-xs font-mono text-emerald-400">{schedules.length} Active Lines</span>
        </div>

        <div className="space-y-3">
          {schedules.map((sch) => {
            const isPub = sch.status === 'PUBLISHED';
            return (
              <div
                key={sch.id}
                className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{sch.routeName}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {sch.routeId} &bull; {sch.id}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isPub
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {sch.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 mt-1 text-[11px]">
                    <span className="font-mono text-emerald-400">
                      Dep: {sch.departureTime} ➔ Arr: {sch.arrivalTime}
                    </span>
                    <span>&bull;</span>
                    <span>Bus: {sch.busId}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isPub && (
                    <button
                      onClick={() => handlePublishSchedule(sch.id)}
                      disabled={publishingId === sch.id}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteSchedule(sch.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700 transition-colors"
                    title="Delete schedule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Custom Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white">Create Custom Schedule</h3>
            <form onSubmit={handleCreateManual} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Route Corridor</label>
                <select
                  value={newRouteId}
                  onChange={(e) => setNewRouteId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.id}: {r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Vehicle</label>
                <select
                  value={newBusId}
                  onChange={(e) => setNewBusId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {buses.map(b => (
                    <option key={b.id} value={b.id}>{b.id} ({b.regNo} - {b.model})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Departure</label>
                  <input
                    type="time"
                    required
                    value={newDepTime}
                    onChange={(e) => setNewDepTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Arrival</label>
                  <input
                    type="time"
                    required
                    value={newArrTime}
                    onChange={(e) => setNewArrTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
