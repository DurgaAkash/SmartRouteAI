import React from 'react';
import { Bus, MapPin, Sparkles, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Bus className="w-4 h-4" />
              </div>
              <span className="text-white font-bold text-base">SmartRoute AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-Based Smart Rural Transportation Planning and Optimization System. Enhancing mobility, reducing empty running, and empowering rural communities across India.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Fullstack Active &bull; SQLite Persistence</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              Transit Coverage
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>OpenStreetMap Dynamic Indian Geocoding</li>
              <li>OSRM Road Route &amp; Alternate Paths</li>
              <li>Vel Tech - Avadi - Thiruvallur Corridor</li>
              <li>Inter-Village Rural Feeder Networks</li>
              <li>GTFS &amp; Public Transit Dataset Ingestion</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              AI &amp; Optimization
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Random Forest Regression Model</li>
              <li>Baseline Linear Comparison (RMSE &amp; R²)</li>
              <li>8-Stage Agentic AI Transportation Planner</li>
              <li>Human Approval Workflow (Approve/Reject)</li>
              <li>Fleet Capacity &amp; Turnaround Optimization</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              College Minor Project
            </h4>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs space-y-1.5">
              <p className="text-slate-200 font-semibold">SmartRoute AI Prototype</p>
              <p className="text-slate-400 text-[11px]">Academic Minor Project Implementation</p>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                <span>Free &amp; Open-Source Stack: Node/Express + Leaflet + OSM + Scikit-Learn</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 SmartRoute AI. OpenStreetMap data &amp; OSRM routing. GPS tracking is simulated for prototype evaluation.</p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-mono text-emerald-400/80">Vel Tech Rural Mobility Lab</span>
            <span className="text-slate-700">|</span>
            <span className="text-[11px] font-mono text-slate-400">v1.0.0 (Production Candidate)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
