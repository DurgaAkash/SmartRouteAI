import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Ticket, 
  TrendingUp, 
  Bus, 
  Calendar, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  ArrowRight, 
  RefreshCw, 
  FileText, 
  ShieldCheck,
  Clock,
  Play,
  Check,
  X,
  History,
  Layers,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { User, CheckIn, SchedulePlanVersion, PlannedTrip, Route, Bus as BusType } from '../types';

interface AdminDashboardProps {
  currentUser: User | null;
  onNavigate: (tab: string) => void;
  onOpenLogin: (isAdmin: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onNavigate,
  onOpenLogin,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [schedulePlans, setSchedulePlans] = useState<SchedulePlanVersion[]>([]);
  const [activePlan, setActivePlan] = useState<SchedulePlanVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [scenarioMessage, setScenarioMessage] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<'NONE' | 'TEST_A' | 'TEST_B'>('NONE');
  const [adminNotes, setAdminNotes] = useState('');
  const [isEditingTrips, setIsEditingTrips] = useState(false);
  const [editableTrips, setEditableTrips] = useState<PlannedTrip[]>([]);

  // Passenger Request & Approval State
  const [passengerRequests, setPassengerRequests] = useState<CheckIn[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<BusType[]>([]);
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [approvalModalReq, setApprovalModalReq] = useState<CheckIn | null>(null);
  const [assignScheduleMode, setAssignScheduleMode] = useState<boolean>(true);
  const [approvalRouteId, setApprovalRouteId] = useState<string>('');
  const [approvalBusId, setApprovalBusId] = useState<string>('');
  const [approvalDepartureTime, setApprovalDepartureTime] = useState<string>('');
  const [approvalRemarks, setApprovalRemarks] = useState<string>('');
  const [requestActionLoading, setRequestActionLoading] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, plansData, schedulePlansData, reqsData, routesData, busesData] = await Promise.all([
        api.getDashboardStats(),
        api.getPlans().catch(() => []),
        api.getSchedulePlans().catch(() => []),
        api.getCheckIns().catch(() => []),
        api.getRoutes().catch(() => []),
        api.getBuses().catch(() => []),
      ]);
      setStats(statsData);
      setPlans(plansData);
      setSchedulePlans(schedulePlansData);
      setPassengerRequests(reqsData);
      setRoutes(routesData);
      setBuses(busesData);
      if (schedulePlansData.length > 0) {
        setActivePlan(schedulePlansData[0]);
        setEditableTrips(schedulePlansData[0].trips);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchDashboardData();
    }
  }, [currentUser]);

  // Requirement 1 & 6: Recalculate Schedules Every Time Admin Runs Planner
  const handleGenerateOptimizedSchedule = async () => {
    setOptimizing(true);
    try {
      const newPlan = await api.generateOptimizedSchedule({
        turnaroundMins: 15,
      });
      setActivePlan(newPlan);
      setEditableTrips(newPlan.trips);
      setIsEditingTrips(false);
      // Reload schedule plans list & stats
      const [allPlans, freshStats] = await Promise.all([
        api.getSchedulePlans(),
        api.getDashboardStats(),
      ]);
      setSchedulePlans(allPlans);
      setStats(freshStats);
    } catch (err: any) {
      alert('Schedule optimization failed: ' + err.message);
    } finally {
      setOptimizing(false);
    }
  };

  // Requirement 7: Schedule Versioning & Admin Approval Actions
  const handlePlanAction = async (action: 'APPROVE' | 'MODIFY' | 'REJECT') => {
    if (!activePlan) return;
    setActionLoading(true);
    try {
      const updated = await api.actionSchedulePlan({
        versionId: activePlan.versionId,
        action,
        modifiedTrips: isEditingTrips ? editableTrips : undefined,
        notes: adminNotes || undefined,
      });
      setActivePlan(updated);
      setIsEditingTrips(false);
      const [allPlans, freshStats] = await Promise.all([
        api.getSchedulePlans(),
        api.getDashboardStats(),
      ]);
      setSchedulePlans(allPlans);
      setStats(freshStats);
      if (action === 'APPROVE') {
        alert(`Schedule plan ${updated.versionId} approved! Published trips are now live on passenger schedules.`);
      }
    } catch (err: any) {
      alert(`Action ${action} failed: ` + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Requirement 8: Interactive Test Suite Scenarios
  const handleLoadScenario = async (scenario: 'TEST_A' | 'TEST_B' | 'RESET') => {
    setScenarioLoading(true);
    try {
      const res = await api.seedScenario(scenario);
      setScenarioMessage(res.message);
      setActiveScenario(scenario === 'RESET' ? 'NONE' : scenario);
      await fetchDashboardData();
    } catch (err: any) {
      alert('Failed loading test scenario: ' + err.message);
    } finally {
      setScenarioLoading(false);
    }
  };

  // Passenger Request Approval / Rejection Handlers
  const handleOpenApprovalModal = (req: CheckIn) => {
    setApprovalModalReq(req);
    setAssignScheduleMode(true);
    setApprovalRouteId(req.routeId || (routes[0]?.id || ''));
    setApprovalBusId(buses[0]?.id || '');
    setApprovalDepartureTime(req.travelTime || '08:30');
    setApprovalRemarks('Capacity and schedule slot confirmed by operations.');
  };

  const handleConfirmApproval = async () => {
    if (!approvalModalReq) return;
    setRequestActionLoading(true);
    try {
      const assignedRoute = routes.find((r) => r.id === approvalRouteId);
      const assignedBus = buses.find((b) => b.id === approvalBusId);

      await api.updateRequestStatus(approvalModalReq.id, {
        status: 'approved',
        assignedRouteId: assignScheduleMode ? approvalRouteId : undefined,
        assignedRouteName: assignScheduleMode ? (assignedRoute?.name || approvalRouteId) : undefined,
        assignedBusId: assignScheduleMode ? approvalBusId : undefined,
        assignedBusRegNo: assignScheduleMode ? (assignedBus?.regNo || approvalBusId) : undefined,
        assignedDepartureTime: assignScheduleMode ? approvalDepartureTime : undefined,
        assignedScheduleId: assignScheduleMode ? `SCH-ASSIGN-${Date.now().toString().slice(-4)}` : undefined,
        adminRemarks: approvalRemarks || undefined,
      });

      setApprovalModalReq(null);
      await fetchDashboardData();
    } catch (err: any) {
      alert('Failed to approve request: ' + err.message);
    } finally {
      setRequestActionLoading(false);
    }
  };

  const handleQuickApproveAwaiting = async (req: CheckIn) => {
    setRequestActionLoading(true);
    try {
      await api.updateRequestStatus(req.id, {
        status: 'approved',
        adminRemarks: 'Approved by dispatch operations. Awaiting schedule and bus assignment.',
      });
      await fetchDashboardData();
    } catch (err: any) {
      alert('Failed to approve request: ' + err.message);
    } finally {
      setRequestActionLoading(false);
    }
  };

  const handleRejectRequest = async (req: CheckIn) => {
    const reason = prompt('Please enter rejection reason / operational notes:', 'Corridor operating at fleet constraint. Alternate regional feeder suggested.');
    if (reason === null) return;
    setRequestActionLoading(true);
    try {
      await api.updateRequestStatus(req.id, {
        status: 'rejected',
        adminRemarks: reason || 'Travel request rejected by dispatch authority.',
      });
      await fetchDashboardData();
    } catch (err: any) {
      alert('Failed to reject request: ' + err.message);
    } finally {
      setRequestActionLoading(false);
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-indigo-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          This portal is reserved for authorized district transport officers and planning engineers. Please sign in with administrator credentials.
        </p>
        <button
          onClick={() => onOpenLogin(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-colors"
        >
          Sign In as Administrator
        </button>
      </div>
    );
  }

  const diff = activePlan?.diff;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 font-mono mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>District Transportation Command Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrator Overview &amp; Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Logged in as {currentUser.name} &bull; Real-time demand monitoring, fleet scheduling, and AI plan approvals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Main Action Button (Requirement 1 & 6) */}
          <button
            onClick={handleGenerateOptimizedSchedule}
            disabled={optimizing}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {optimizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Optimizing Fleet Timetable...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Optimized Schedule</span>
              </>
            )}
          </button>

          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Passenger Check-Ins</span>
            <Ticket className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats?.totalCheckIns || 0}</p>
          <p className="text-[11px] text-emerald-400 mt-1 font-mono">
            {stats?.recordedDemand || 0} Total Headcount Recorded
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>AI Demand Forecast</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats?.predictedDemand || 0}</p>
          <p className="text-[11px] text-purple-400 mt-1 font-mono">
            Diurnal &amp; Peak Adjusted
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Bus Fleet</span>
            <Bus className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats?.activeBuses || 0} / {stats?.totalBuses || 0}</p>
          <p className="text-[11px] text-sky-400 mt-1 font-mono">
            GPS Telematics Connected
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Timetable Status</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{activePlan?.versionId || 'PLAN-V1'}</p>
          <p className="text-[11px] text-amber-400 mt-1 font-mono">
            Status: {activePlan?.status || 'PROPOSED'}
          </p>
        </div>
      </div>

      {/* Requirement 8: Interactive Scenario Test Suite (Test A vs Test B) */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Dynamic Route Selection &amp; Demand Test Suite (Requirement 8)</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Active Scenario: <strong className="text-emerald-400">{activeScenario}</strong>
          </span>
        </div>

        <p className="text-xs text-slate-300">
          Verify that the optimizer dynamically redistributes bus trips based on passenger demand instead of prioritizing predefined routes:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleLoadScenario('TEST_A')}
            disabled={scenarioLoading}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeScenario === 'TEST_A'
                ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-xs mb-1">
              <span>Test Scenario A</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Village A Priority</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <p>&bull; <strong>Village A ➔ Town B:</strong> <span className="text-emerald-400 font-bold">45 Pax (High)</span></p>
              <p>&bull; <strong>Khambhampadu ➔ Tiruvuru:</strong> <span className="text-amber-400 font-bold">10 Pax (Low)</span></p>
            </div>
          </button>

          <button
            onClick={() => handleLoadScenario('TEST_B')}
            disabled={scenarioLoading}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeScenario === 'TEST_B'
                ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-xs mb-1">
              <span>Test Scenario B</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">Khambhampadu Surge</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <p>&bull; <strong>Khambhampadu ➔ Tiruvuru:</strong> <span className="text-emerald-400 font-bold">50 Pax (High)</span></p>
              <p>&bull; <strong>Village A ➔ Town B:</strong> <span className="text-amber-400 font-bold">5 Pax (Low)</span></p>
            </div>
          </button>

          <button
            onClick={() => handleLoadScenario('RESET')}
            disabled={scenarioLoading}
            className="p-3.5 rounded-xl border bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600 text-left transition-all flex flex-col justify-between"
          >
            <div className="font-bold text-xs mb-1 text-white">Reset Database Demand</div>
            <p className="text-[11px] text-slate-400">
              Clear synthetic scenarios and restore standard multi-village passenger logs.
            </p>
          </button>
        </div>

        {scenarioMessage && (
          <div className="p-3 rounded-xl bg-slate-800 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between">
            <span>{scenarioMessage}</span>
            <span className="text-[10px] text-slate-400">Click "Generate Optimized Schedule" above to compute plan!</span>
          </div>
        )}
      </div>

      {/* Requirement 5 & 7: Optimized Schedule Plan Version & Diff Console */}
      {activePlan && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Header & Versioning Bar (Requirement 7) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  {activePlan.versionId}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  activePlan.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                  activePlan.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                  activePlan.status === 'MODIFIED' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {activePlan.status}
                </span>
                <h2 className="text-lg font-bold text-white">
                  Optimized Transit Schedule
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Generated at: {new Date(activePlan.generatedAt).toLocaleString()} &bull; Data used: {activePlan.dataSnapshot.totalCheckInsUsed} check-ins, {activePlan.dataSnapshot.activeBusesCount} buses, {activePlan.dataSnapshot.activeRoutesCount} routes.
              </p>
            </div>

            {/* Version Selector & Approval Actions (Requirement 7) */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={activePlan.versionId}
                onChange={(e) => {
                  const selected = schedulePlans.find(p => p.versionId === e.target.value);
                  if (selected) {
                    setActivePlan(selected);
                    setEditableTrips(selected.trips);
                    setIsEditingTrips(false);
                  }
                }}
                className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {schedulePlans.map((p) => (
                  <option key={p.versionId} value={p.versionId}>
                    {p.versionId} ({p.status}) - {new Date(p.generatedAt).toLocaleTimeString()}
                  </option>
                ))}
              </select>

              {activePlan.status !== 'APPROVED' && (
                <button
                  onClick={() => handlePlanAction('APPROVE')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve &amp; Publish
                </button>
              )}

              <button
                onClick={() => setIsEditingTrips(!isEditingTrips)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                {isEditingTrips ? 'Cancel Edits' : 'Modify Schedule'}
              </button>

              {activePlan.status !== 'REJECTED' && (
                <button
                  onClick={() => handlePlanAction('REJECT')}
                  disabled={actionLoading}
                  className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-xl border border-rose-500/30 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject
                </button>
              )}
            </div>
          </div>

          {/* KPI Summary for this Plan Version */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/50 p-4 rounded-xl font-mono text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">TOTAL DISPATCHES</span>
              <span className="text-white font-bold text-base">{activePlan.metrics.totalTrips} Trips</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">SERVED DEMAND</span>
              <span className="text-emerald-400 font-bold text-base">{activePlan.metrics.servedDemand} Passengers</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">DEMAND SATISFACTION</span>
              <span className="text-purple-300 font-bold text-base">{activePlan.metrics.demandSatisfactionPct}%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">FLEET UTILIZATION</span>
              <span className="text-sky-400 font-bold text-base">{activePlan.metrics.fleetUtilizationPct}%</span>
            </div>
          </div>

          {/* Requirement 5: Difference Between Old and New Schedules (Diff Engine) */}
          {diff && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-sky-400" />
                  Schedule Difference &amp; Dynamic Transition Analysis (Requirement 5)
                </h3>
                {diff.previousVersionId && (
                  <span className="text-[11px] font-mono text-slate-400">
                    Compared against: <strong>{diff.previousVersionId}</strong>
                  </span>
                )}
              </div>

              {/* Diff Table (Required by Section 5) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Added Trips */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Added Trips ({diff.addedTrips.length})
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Demand Surge</span>
                  </div>
                  {diff.addedTrips.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {diff.addedTrips.map(trip => (
                        <div key={trip.tripId} className="p-2 rounded-lg bg-slate-900/80 text-[11px] space-y-1">
                          <div className="font-bold text-white">{trip.routeName}</div>
                          <div className="flex justify-between text-slate-400 font-mono">
                            <span>Dep: {trip.departureTime}</span>
                            <span className="text-emerald-400 font-bold">{trip.allocatedCapacity} Seats</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">No newly added trips in this proposal.</p>
                  )}
                </div>

                {/* Removed / Reduced Trips */}
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Removed / Frequency Reduced ({diff.removedTrips.length})
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">Low Demand</span>
                  </div>
                  {diff.removedTrips.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {diff.removedTrips.map(trip => (
                        <div key={trip.tripId} className="p-2 rounded-lg bg-slate-900/80 text-[11px] space-y-1">
                          <div className="font-bold text-white">{trip.routeName}</div>
                          <div className="flex justify-between text-slate-400 font-mono">
                            <span>Dep: {trip.departureTime}</span>
                            <span className="text-amber-400">Omitted</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">No trips omitted from previous baseline.</p>
                  )}
                </div>

                {/* Modified Timing & Fleet Assignments */}
                <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-sky-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      Modified Dispatches ({diff.modifiedTrips.length})
                    </span>
                    <span className="text-[10px] text-sky-400 font-mono">Timing / Bus Reassigned</span>
                  </div>
                  {diff.modifiedTrips.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {diff.modifiedTrips.map((mod, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-900/80 text-[11px] space-y-1">
                          <div className="font-bold text-white">{mod.routeName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {mod.oldDetails.departureTime} ➔ <span className="text-sky-300 font-bold">{mod.newDetails.departureTime}</span> ({mod.newDetails.busId})
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">Timetable slots maintained without shift.</p>
                  )}
                </div>
              </div>

              {/* Reasons for Changes (Required by Section 5) */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-sky-400" />
                  Operational Reasons for Schedule Adjustments
                </span>
                <ul className="space-y-1.5 text-slate-300 pl-4 list-disc text-[11px]">
                  {diff.changeReasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>

              {/* Unmet Demand Section (Required by Section 3 & 5) */}
              {diff.unmetDemand.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Unmet Passenger Demand Alert &amp; Operational Alternatives</span>
                  </div>
                  <div className="space-y-2">
                    {diff.unmetDemand.map((unmet, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                        <div>
                          <span className="font-bold text-white">{unmet.corridor}</span>
                          <p className="text-slate-400 mt-0.5">{unmet.recommendation}</p>
                        </div>
                        <div className="font-mono text-rose-400 font-bold shrink-0">
                          Shortfall: {unmet.unmetPassengers} Passengers
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Planned Trips Master Table (Requirement 1, 2, 3) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Feasible Bus Dispatches &amp; Turnaround Verification ({activePlan.trips.length} Trips)
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                15m Turnaround Enforced &bull; Zero Conflict
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-800">
                <thead>
                  <tr className="text-slate-400 font-mono text-[10px] uppercase bg-slate-800/40">
                    <th className="px-3 py-2">Trip ID</th>
                    <th className="px-3 py-2">Corridor / Route</th>
                    <th className="px-3 py-2">Departure</th>
                    <th className="px-3 py-2">Arrival</th>
                    <th className="px-3 py-2">Assigned Bus</th>
                    <th className="px-3 py-2">Capacity / Exp. Pax</th>
                    <th className="px-3 py-2">Feasibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {editableTrips.map((trip, idx) => (
                    <tr key={trip.tripId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-3 py-2.5 text-white font-bold">{trip.tripId}</td>
                      <td className="px-3 py-2.5 font-sans">
                        <p className="font-bold text-white">{trip.routeName}</p>
                        <p className="text-[10px] text-slate-400">{trip.origin} ➔ {trip.destination}</p>
                      </td>
                      <td className="px-3 py-2.5 text-emerald-400 font-bold">
                        {isEditingTrips ? (
                          <input
                            type="time"
                            value={trip.departureTime}
                            onChange={(e) => {
                              const updated = [...editableTrips];
                              updated[idx].departureTime = e.target.value;
                              setEditableTrips(updated);
                            }}
                            className="bg-slate-800 border border-slate-700 rounded px-1 text-white"
                          />
                        ) : (
                          trip.departureTime
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-sky-400 font-bold">{trip.arrivalTime}</td>
                      <td className="px-3 py-2.5 font-sans">
                        <span className="text-white font-bold">{trip.busRegNo}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">({trip.busModel})</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-emerald-400 font-bold">{trip.expectedPassengers}</span> / {trip.allocatedCapacity} Seats
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" />
                          {trip.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isEditingTrips && (
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setIsEditingTrips(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePlanAction('MODIFY')}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl"
                >
                  Save Manual Adjustments
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Quick Action Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => onNavigate('demand-analysis')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group"
        >
          <TrendingUp className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-bold text-white">Demand Analytics</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Peak hour curves</p>
        </button>

        <button
          onClick={() => onNavigate('ai-prediction')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 text-left transition-all group"
        >
          <Sparkles className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-bold text-white">AI Prediction</p>
          <p className="text-[10px] text-slate-400 mt-0.5">ML model metrics</p>
        </button>

        <button
          onClick={() => onNavigate('route-optimization')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 text-left transition-all group"
        >
          <Sliders className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-bold text-white">Route Optimizer</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Bypass chokepoints</p>
        </button>

        <button
          onClick={() => onNavigate('schedule-planning')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 text-left transition-all group"
        >
          <Calendar className="w-4 h-4 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-bold text-white">Schedule Planner</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Capacity allocator</p>
        </button>

        <button
          onClick={() => onNavigate('bus-management')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group"
        >
          <Bus className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-bold text-white">Fleet Manager</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Buses &amp; stops CRUD</p>
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 text-left transition-all group"
        >
          <FileText className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-bold text-white">Reports &amp; KPIs</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Fuel &amp; rural impact</p>
        </button>
      </div>

      {/* Main Content: Recent Passenger Check-ins + Pending AI Agent Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Passenger Travel Requests & Demand Approval Center */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Passenger Travel Requests</h3>
                <p className="text-[11px] text-slate-400">Review, approve &amp; assign fleet schedules</p>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-[10px] font-semibold">
              <button
                onClick={() => setRequestFilter('all')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  requestFilter === 'all' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({passengerRequests.length})
              </button>
              <button
                onClick={() => setRequestFilter('pending')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  requestFilter === 'pending' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                Pending ({passengerRequests.filter((r) => r.status === 'pending' || r.status === 'TRAVEL_INTENTION').length})
              </button>
              <button
                onClick={() => setRequestFilter('approved')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  requestFilter === 'approved' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                Approved ({passengerRequests.filter((r) => r.status === 'approved').length})
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {passengerRequests
              .filter((r) => {
                if (requestFilter === 'pending') return r.status === 'pending' || r.status === 'TRAVEL_INTENTION';
                if (requestFilter === 'approved') return r.status === 'approved';
                if (requestFilter === 'rejected') return r.status === 'rejected';
                return true;
              })
              .map((checkIn: CheckIn) => {
                const isApproved = checkIn.status === 'approved';
                const isPending = checkIn.status === 'pending' || checkIn.status === 'TRAVEL_INTENTION';
                const hasBusAssignment = Boolean(checkIn.assignedBusRegNo || checkIn.assignedBusId);

                return (
                  <div
                    key={checkIn.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                      isApproved
                        ? 'bg-slate-800/80 border-emerald-500/40'
                        : isPending
                        ? 'bg-slate-800/60 border-amber-500/40'
                        : 'bg-slate-850/50 border-slate-800 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white">{checkIn.userName}</span>
                        <span className="text-slate-400 text-[11px] ml-2 font-mono">({checkIn.userPhone})</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isPending
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {isApproved ? 'Approved' : isPending ? 'Pending Review' : 'Rejected'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="font-semibold">{checkIn.origin} ➔ {checkIn.destination}</span>
                      <span className="text-purple-300 font-bold font-mono">{checkIn.passengerCount} Pax</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800">
                      <span>Date: {checkIn.travelDate} @ {checkIn.travelTime}</span>
                      <span>ID: {checkIn.id}</span>
                    </div>

                    {/* Assigned Bus / Schedule info or Awaiting indicator */}
                    {isApproved && (
                      <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 text-[11px] space-y-1">
                        {hasBusAssignment ? (
                          <div className="flex items-center justify-between text-emerald-300">
                            <span>Assigned Bus: <strong className="font-mono text-white">{checkIn.assignedBusRegNo || checkIn.assignedBusId}</strong> ({checkIn.assignedRouteName || checkIn.routeName})</span>
                            <span className="font-mono font-bold text-white">@ {checkIn.assignedDepartureTime || checkIn.travelTime}</span>
                          </div>
                        ) : (
                          <p className="text-amber-300 font-medium">
                            Status: Approved – Awaiting Schedule Assignment
                          </p>
                        )}
                        {checkIn.adminRemarks && (
                          <p className="text-[10px] text-slate-400 italic">Notes: {checkIn.adminRemarks}</p>
                        )}
                      </div>
                    )}

                    {/* Operational Action Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-800/80">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleOpenApprovalModal(checkIn)}
                            disabled={requestActionLoading}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Approve &amp; Assign Bus
                          </button>
                          <button
                            onClick={() => handleQuickApproveAwaiting(checkIn)}
                            disabled={requestActionLoading}
                            className="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 rounded-lg font-semibold text-[11px] transition-colors"
                          >
                            Approve (Awaiting Schedule)
                          </button>
                          <button
                            onClick={() => handleRejectRequest(checkIn)}
                            disabled={requestActionLoading}
                            className="px-2 py-1 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded-lg font-semibold text-[11px] transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <>
                          <button
                            onClick={() => handleOpenApprovalModal(checkIn)}
                            disabled={requestActionLoading}
                            className="px-2.5 py-1 bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-500/40 rounded-lg font-semibold text-[11px] transition-colors"
                          >
                            Reassign Schedule / Bus
                          </button>
                          <button
                            onClick={() => handleRejectRequest(checkIn)}
                            disabled={requestActionLoading}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[10px] transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right: Agentic AI Plans */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Agentic AI Planning Requests</h3>
            </div>
            <button
              onClick={() => onNavigate('agent-planner')}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              Open Agent Console
            </button>
          </div>

          {plans.length > 0 ? (
            <div className="space-y-3">
              {plans.slice(0, 3).map((plan) => (
                <div key={plan.id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{plan.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      plan.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                      plan.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {plan.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] italic">"{plan.requestText}"</p>
                  <div className="grid grid-cols-3 gap-2 py-1.5 bg-slate-900/80 px-2 rounded-lg font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[9px]">PREDICTED</span>
                      <span className="text-purple-300 font-bold">{plan.predictedDemand} Pax</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">FLEET CAP</span>
                      <span className="text-sky-300 font-bold">{plan.totalFleetCapacity} Seats</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">TRIPS</span>
                      <span className="text-emerald-400 font-bold">{plan.proposedTrips?.length || 0} Dispatches</span>
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => onNavigate('agent-planner')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                    >
                      Review Execution Trace &amp; Approve <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              <p>No plans generated yet. Click "Launch Agentic Planner" above to generate automated rural bus timetables.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
