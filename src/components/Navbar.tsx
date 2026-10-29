import React from 'react';
import { 
  Bus, 
  MapPin, 
  Calendar, 
  Ticket, 
  History, 
  LayoutDashboard, 
  TrendingUp, 
  Cpu, 
  Sliders, 
  Clock, 
  Sparkles, 
  FolderGit2, 
  FileText, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogin: (isAdmin: boolean) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenLogin,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isPassenger = currentUser?.role === 'passenger';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bus className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">SmartRoute</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Rural Transportation Optimization System</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'home'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </button>

            {/* Passenger Links */}
            {(!currentUser || isPassenger) && (
              <>
                <button
                  onClick={() => setActiveTab('route-search')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'route-search'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Route Search
                </button>
                <button
                  onClick={() => setActiveTab('bus-tracking')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'bus-tracking'
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Bus className="w-3.5 h-3.5" />
                  Bus Tracking
                </button>
                <button
                  onClick={() => setActiveTab('schedules')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'schedules'
                      ? 'bg-slate-800 text-emerald-400 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Schedules
                </button>
                {isPassenger && (
                  <>
                    <button
                      onClick={() => setActiveTab('passenger-dashboard')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeTab === 'passenger-dashboard'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      My Dashboard
                    </button>
                    <button
                      onClick={() => setActiveTab('check-in')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeTab === 'check-in'
                          ? 'bg-slate-800 text-emerald-400 font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      Check-In
                    </button>
                    <button
                      onClick={() => setActiveTab('travel-history')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeTab === 'travel-history'
                          ? 'bg-slate-800 text-emerald-400 font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      History
                    </button>
                  </>
                )}
              </>
            )}

            {/* Admin Links */}
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('admin-dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'admin-dashboard'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Admin Console
                </button>
                <button
                  onClick={() => setActiveTab('demand-analysis')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'demand-analysis'
                      ? 'bg-slate-800 text-cyan-400 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Demand
                </button>
                <button
                  onClick={() => setActiveTab('ai-prediction')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'ai-prediction'
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  AI Predict
                </button>
                <button
                  onClick={() => setActiveTab('agent-planner')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'agent-planner'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Agentic AI
                </button>
                <button
                  onClick={() => setActiveTab('route-optimization')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'route-optimization'
                      ? 'bg-slate-800 text-amber-400 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Routes
                </button>
                <button
                  onClick={() => setActiveTab('schedule-planning')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'schedule-planning'
                      ? 'bg-slate-800 text-sky-400 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Planner
                </button>
                <button
                  onClick={() => setActiveTab('bus-management')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'bus-management'
                      ? 'bg-slate-800 text-emerald-400 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Bus className="w-3.5 h-3.5" />
                  Fleet
                </button>
                <button
                  onClick={() => setActiveTab('datasets')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'datasets'
                      ? 'bg-slate-800 text-indigo-400 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  Datasets
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'reports'
                      ? 'bg-slate-800 text-emerald-400 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Reports
                </button>
              </>
            )}
          </nav>

          {/* Right User Actions */}
          <div className="hidden md:flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isAdmin ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-200 leading-tight">{currentUser.name}</p>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase ${
                      isAdmin ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/50' : 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenLogin(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                  Passenger Login
                </button>
                <button
                  onClick={() => onOpenLogin(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Portal
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-1">
          <div className="pb-2 border-b border-slate-800 mb-2">
            {currentUser ? (
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{currentUser.name}</p>
                  <p className="text-xs text-slate-400">{currentUser.email} ({currentUser.role})</p>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1 bg-rose-500/20 text-rose-300 text-xs rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 py-2">
                <button
                  onClick={() => {
                    onOpenLogin(false);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-slate-800 text-emerald-400 text-xs rounded-lg font-medium"
                >
                  Passenger Login
                </button>
                <button
                  onClick={() => {
                    onOpenLogin(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-indigo-600 text-white text-xs rounded-lg font-semibold"
                >
                  Admin Portal
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1 text-xs">
            <button
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
              className="p-2 text-left text-slate-300 hover:bg-slate-800 rounded"
            >
              Home
            </button>
            <button
              onClick={() => { setActiveTab('route-search'); setMobileMenuOpen(false); }}
              className="p-2 text-left text-slate-300 hover:bg-slate-800 rounded"
            >
              Route Search
            </button>
            <button
              onClick={() => { setActiveTab('bus-tracking'); setMobileMenuOpen(false); }}
              className="p-2 text-left text-slate-300 hover:bg-slate-800 rounded"
            >
              Bus Tracking
            </button>
            <button
              onClick={() => { setActiveTab('schedules'); setMobileMenuOpen(false); }}
              className="p-2 text-left text-slate-300 hover:bg-slate-800 rounded"
            >
              Bus Schedules
            </button>
            {isPassenger && (
              <>
                <button
                  onClick={() => { setActiveTab('passenger-dashboard'); setMobileMenuOpen(false); }}
                  className="p-2 text-left text-emerald-400 hover:bg-slate-800 rounded font-medium"
                >
                  Passenger Dashboard
                </button>
                <button
                  onClick={() => { setActiveTab('check-in'); setMobileMenuOpen(false); }}
                  className="p-2 text-left text-slate-300 hover:bg-slate-800 rounded"
                >
                  Check-In
                </button>
                <button
                  onClick={() => { setActiveTab('travel-history'); setMobileMenuOpen(false); }}
                  className="p-2 text-left text-slate-300 hover:bg-slate-800 rounded"
                >
                  Travel History
                </button>
              </>
            )}
            {isAdmin && (
              <>
                <button
                  onClick={() => { setActiveTab('admin-dashboard'); setMobileMenuOpen(false); }}
                  className="p-2 text-left text-indigo-400 hover:bg-slate-800 rounded font-medium"
                >
                  Admin Dashboard
                </button>
                <button
                  onClick={() => { setActiveTab('agent-planner'); setMobileMenuOpen(false); }}
                  className="p-2 text-left text-emerald-400 hover:bg-slate-800 rounded font-bold"
                >
                  Agentic AI Planner
                </button>
                <button
                  onClick={() => { setActiveTab('demand-analysis'); setMobileMenuOpen(false); }}
                  className="p-2 text-left text-slate-300 hover:bg-slate-800 rounded"
                >
                  Demand Analysis
                </button>
                <button
                  onClick={() => { setActiveTab('ai-prediction'); setMobileMenuOpen(false); }}
                  className="p-2 text-left text-slate-300 hover:bg-slate-800 rounded"
                >
                  AI Demand Prediction
                </button>
                <button
                  onClick={() => { setActiveTab('route-optimization'); setMobileMenuOpen(false); }}
                  className="p-2 text-left text-slate-300 hover:bg-slate-800 rounded"
                >
                  Route Optimization
                </button>
                <button
                  onClick={() => { setActiveTab('schedule-planning'); setMobileMenuOpen(false); }}
                  className="p-2 text-left text-slate-300 hover:bg-slate-800 rounded"
                >
                  Schedule Planning
                </button>
                <button
                  onClick={() => { setActiveTab('bus-management'); setMobileMenuOpen(false); }}
                  className="p-2 text-left text-slate-300 hover:bg-slate-800 rounded"
                >
                  Fleet Management
                </button>
                <button
                  onClick={() => { setActiveTab('datasets'); setMobileMenuOpen(false); }}
                  className="p-2 text-left text-slate-300 hover:bg-slate-800 rounded"
                >
                  Datasets
                </button>
                <button
                  onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }}
                  className="p-2 text-left text-slate-300 hover:bg-slate-800 rounded"
                >
                  Reports
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
