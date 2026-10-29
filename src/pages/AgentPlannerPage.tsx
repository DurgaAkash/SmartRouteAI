import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Edit3, 
  ArrowRight, 
  Clock, 
  Bus, 
  Cpu, 
  Sliders, 
  ShieldCheck, 
  Play, 
  UploadCloud,
  FileText,
  Layers,
  History
} from 'lucide-react';
import { api } from '../services/api';
import { AgentPlan, User } from '../types';

interface AgentPlannerPageProps {
  currentUser: User | null;
  onNavigate: (tab: string) => void;
  onOpenLogin: (isAdmin: boolean) => void;
}

export const AgentPlannerPage: React.FC<AgentPlannerPageProps> = ({
  currentUser,
  onNavigate,
  onOpenLogin,
}) => {
  const [requestText, setRequestText] = useState(
    'Plan bus services for Vel Tech Junction, Morai Village Center, and Kollumedu tomorrow morning from 7 AM to 10 AM using 4 available buses'
  );
  const [targetVillages, setTargetVillages] = useState<string>('Vel Tech Junction, Morai Village Center, Kollumedu Rural Colony');
  const [numBuses, setNumBuses] = useState<number>(4);
  const [timeWindow, setTimeWindow] = useState<string>('7:00 AM - 10:00 AM');

  const [activePlan, setActivePlan] = useState<AgentPlan | null>(null);
  const [planHistory, setPlanHistory] = useState<AgentPlan[]>([]);
  const [running, setRunning] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [editableTrips, setEditableTrips] = useState<any[]>([]);

  const loadPlans = async () => {
    try {
      const data = await api.getPlans();
      setPlanHistory(data);
      if (data.length > 0 && !activePlan) {
        setActivePlan(data[0]);
        setEditableTrips(data[0].proposedTrips);
      }
    } catch (err) {
      console.error('Error loading plans:', err);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadPlans();
    }
  }, [currentUser]);

  const handleRunAgent = async () => {
    setRunning(true);
    try {
      const villagesList = targetVillages.split(',').map((v) => v.trim()).filter(Boolean);
      const newPlan = await api.runAgentPlan({
        requestText,
        villages: villagesList,
        numBuses,
        timeWindow,
      });
      setActivePlan(newPlan);
      setEditableTrips(newPlan.proposedTrips);
      setIsModifying(false);
      await loadPlans();
    } catch (err: any) {
      alert('Agent execution failed: ' + err.message);
    } finally {
      setRunning(false);
    }
  };

  const handlePlanAction = async (action: 'APPROVE' | 'MODIFY' | 'REJECT') => {
    if (!activePlan) return;
    setActionLoading(true);
    try {
      const updated = await api.actionPlan({
        planId: activePlan.id,
        action,
        modifiedTrips: isModifying ? editableTrips : undefined,
        notes: adminNotes || undefined,
      });
      setActivePlan(updated);
      setIsModifying(false);
      await loadPlans();
    } catch (err: any) {
      alert(`Action ${action} failed: ` + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Sparkles className="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          The Agentic AI Transportation Planner executes backend database tools and publishes schedules. Please sign in as an administrator to run and approve plans.
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono mb-1">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Autonomous Tool-Calling Multi-Agent System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Agentic AI Transportation Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            An active tool-calling planning agent that queries passenger databases, invokes Random Forest models, verifies depot fleet constraints, and generates human-audited timetables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Human-in-the-Loop Enforced
          </span>
        </div>
      </div>

      {/* Input Prompt Box for Administrator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Natural Language Planning Directive
          </span>
          <span className="text-[10px] font-mono text-slate-500">Autonomous Tool Orchestration</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Planning Instruction</label>
          <textarea
            rows={2}
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            placeholder="e.g. Plan morning bus services for Vel Tech and Morai using 4 buses..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Target Rural Stops</label>
            <input
              type="text"
              value={targetVillages}
              onChange={(e) => setTargetVillages(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-300 mb-1">Fleet Allocation</label>
            <input
              type="number"
              min={1}
              max={8}
              value={numBuses}
              onChange={(e) => setNumBuses(parseInt(e.target.value) || 4)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-300 mb-1">Operating Window</label>
            <input
              type="text"
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-400">
            Calls 6 functional tools: demand query &rarr; ML prediction &rarr; depot fleet query &rarr; route optimizer &rarr; timetable scheduler &rarr; constraint validator.
          </p>
          <button
            onClick={handleRunAgent}
            disabled={running}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-105"
          >
            {running ? (
              <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <>
                <Play className="w-4 h-4" />
                Execute Planning Agent
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Execution Output & Plan Decision Layout */}
      {activePlan && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Tool Execution Steps Trace (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                Live Agent Tool-Calling Trace ({activePlan.executionSteps.length} Steps)
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Deterministic Backend Tools</span>
            </div>

            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {activePlan.executionSteps.map((s) => (
                <div key={s.step} className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] flex items-center justify-center font-bold">
                        {s.step}
                      </span>
                      <span className="font-mono text-white font-bold text-[11px]">{s.tool}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">
                      {new Date(s.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-[11px] text-emerald-300 bg-emerald-950/30 p-2 rounded-lg border border-emerald-500/20 leading-relaxed">
                    <strong>Reasoning:</strong> {s.reasoning}
                  </p>

                  <div className="text-[10px] font-mono text-slate-400 bg-slate-900 p-2 rounded-lg overflow-x-auto">
                    <span className="text-slate-500 block mb-0.5">TOOL OUTPUT:</span>
                    <pre className="text-slate-300 whitespace-pre-wrap">{JSON.stringify(s.output, null, 2)}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Proposed Plan & Human Approval Workflow (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Plan Reference: {activePlan.id}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{activePlan.title}</h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  activePlan.status === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : activePlan.status === 'REJECTED'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {activePlan.status}
              </span>
            </div>

            {/* Plan Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">PREDICTED DEMAND</span>
                <span className="text-purple-300 font-bold text-sm">{activePlan.predictedDemand} Pax</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">FLEET CAPACITY</span>
                <span className="text-sky-300 font-bold text-sm">{activePlan.totalFleetCapacity} Seats</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">CORRIDOR DISTANCE</span>
                <span className="text-emerald-400 font-bold text-sm">{activePlan.totalDistanceKm} km</span>
              </div>
            </div>

            {/* Constraint Warnings */}
            {activePlan.constraintCheck.warnings.length > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-300">
                  <AlertTriangle className="w-4 h-4" /> Operational Constraint Notice:
                </p>
                {activePlan.constraintCheck.warnings.map((w, idx) => (
                  <p key={idx} className="text-[11px] text-amber-200/90">{w}</p>
                ))}
              </div>
            )}

            {/* Proposed Timetable Dispatches */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">Proposed Departure Slots:</span>
                <button
                  type="button"
                  onClick={() => setIsModifying(!isModifying)}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  {isModifying ? 'Done Editing' : 'Modify Headways'}
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {editableTrips.map((trip, idx) => (
                  <div key={trip.tripId} className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white font-mono">{trip.tripId}</span>
                      <span className="text-slate-400 text-[11px] ml-2">
                        {trip.origin} ➔ {trip.destination}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isModifying ? (
                        <input
                          type="time"
                          value={trip.departureTime}
                          onChange={(e) => {
                            const updated = [...editableTrips];
                            updated[idx].departureTime = e.target.value;
                            setEditableTrips(updated);
                          }}
                          className="bg-slate-900 border border-slate-600 rounded px-1.5 py-0.5 text-xs text-emerald-400 font-mono"
                        />
                      ) : (
                        <span className="font-mono text-emerald-400 font-bold">{trip.departureTime}</span>
                      )}
                      <span className="text-slate-500">&bull;</span>
                      <span className="font-mono text-sky-400 text-[11px]">{trip.busId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Administrator Decision Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Administrator Approval Notes / Justification
              </label>
              <input
                type="text"
                placeholder="e.g. Approved for rural college examination schedule"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Human Approval Action Buttons per Prompt Section 12 */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">
                Human-in-the-Loop Authority Action:
              </span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handlePlanAction('APPROVE')}
                  disabled={actionLoading || activePlan.status === 'APPROVED'}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve &amp; Publish
                </button>

                <button
                  type="button"
                  onClick={() => handlePlanAction('MODIFY')}
                  disabled={actionLoading}
                  className="py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/30 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  Save Modified
                </button>

                <button
                  type="button"
                  onClick={() => handlePlanAction('REJECT')}
                  disabled={actionLoading || activePlan.status === 'REJECTED'}
                  className="py-2.5 px-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Plan
                </button>
              </div>

              {activePlan.approvedAt && (
                <p className="text-[10px] text-emerald-400 font-mono text-center pt-1">
                  &check; Plan approved by {activePlan.approvedBy} on {new Date(activePlan.approvedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Historical Generated Plans Archive */}
      {planHistory.length > 1 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              Prior Generated Plans Log ({planHistory.length})
            </h3>
          </div>

          <div className="space-y-2">
            {planHistory.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setActivePlan(p);
                  setEditableTrips(p.proposedTrips);
                }}
                className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  activePlan?.id === p.id
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <span className="font-bold text-white">{p.title}</span>
                  <p className="text-[11px] text-slate-400">{p.requestText}</p>
                </div>
                <div className="flex items-center gap-3 font-mono text-right">
                  <span className="text-purple-300">{p.predictedDemand} Pax</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    p.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
