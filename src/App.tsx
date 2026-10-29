/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModals } from './pages/AuthModals';
import { HomePage } from './pages/HomePage';
import { PassengerDashboard } from './pages/PassengerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { RouteSearchPage } from './pages/RouteSearchPage';
import { BusTrackingPage } from './pages/BusTrackingPage';
import { BusSchedulePage } from './pages/BusSchedulePage';
import { CheckInPage } from './pages/CheckInPage';
import { TravelHistoryPage } from './pages/TravelHistoryPage';
import { DemandAnalysisPage } from './pages/DemandAnalysisPage';
import { AiPredictionPage } from './pages/AiPredictionPage';
import { RouteOptimizationPage } from './pages/RouteOptimizationPage';
import { SchedulePlanningPage } from './pages/SchedulePlanningPage';
import { AgentPlannerPage } from './pages/AgentPlannerPage';
import { BusRouteManagementPage } from './pages/BusRouteManagementPage';
import { DatasetManagementPage } from './pages/DatasetManagementPage';
import { ReportsPage } from './pages/ReportsPage';
import { authStorage, api } from './services/api';
import { User } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authStorage.getUser());
  const [activeTab, setActiveTab] = useState<string>('home');

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authIsAdmin, setAuthIsAdmin] = useState(false);
  const [authIsRegister, setAuthIsRegister] = useState(false);

  // Check current session on boot
  useEffect(() => {
    if (authStorage.getToken()) {
      api.getMe()
        .then((res) => {
          setCurrentUser(res.user);
          authStorage.setUser(res.user);
        })
        .catch(() => {
          authStorage.clearToken();
          setCurrentUser(null);
        });
    }
  }, []);

  const handleOpenLogin = (isAdmin: boolean) => {
    setAuthIsAdmin(isAdmin);
    setAuthIsRegister(false);
    setAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthIsAdmin(false);
    setAuthIsRegister(true);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveTab('admin-dashboard');
    } else {
      setActiveTab('passenger-dashboard');
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setActiveTab('home');
  };

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={navigateTo}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage onNavigate={navigateTo} onOpenLogin={handleOpenLogin} />
        )}
        {activeTab === 'passenger-dashboard' && (
          <PassengerDashboard currentUser={currentUser} onNavigate={navigateTo} onOpenLogin={handleOpenLogin} />
        )}
        {activeTab === 'admin-dashboard' && (
          <AdminDashboard currentUser={currentUser} onNavigate={navigateTo} onOpenLogin={handleOpenLogin} />
        )}
        {activeTab === 'route-search' && <RouteSearchPage />}
        {activeTab === 'bus-tracking' && <BusTrackingPage />}
        {activeTab === 'schedules' && <BusSchedulePage />}
        {activeTab === 'check-in' && (
          <CheckInPage currentUser={currentUser} onNavigate={navigateTo} onOpenLogin={handleOpenLogin} />
        )}
        {activeTab === 'travel-history' && (
          <TravelHistoryPage currentUser={currentUser} onNavigate={navigateTo} onOpenLogin={handleOpenLogin} />
        )}
        {activeTab === 'demand-analysis' && <DemandAnalysisPage />}
        {activeTab === 'ai-prediction' && <AiPredictionPage />}
        {activeTab === 'route-optimization' && <RouteOptimizationPage />}
        {activeTab === 'schedule-planning' && <SchedulePlanningPage />}
        {activeTab === 'agent-planner' && (
          <AgentPlannerPage currentUser={currentUser} onNavigate={navigateTo} onOpenLogin={handleOpenLogin} />
        )}
        {activeTab === 'bus-management' && <BusRouteManagementPage currentUser={currentUser} />}
        {activeTab === 'datasets' && <DatasetManagementPage />}
        {activeTab === 'reports' && <ReportsPage />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modals */}
      <AuthModals
        isOpen={authModalOpen}
        isAdminMode={authIsAdmin}
        isRegisterMode={authIsRegister}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        onSwitchToRegister={handleOpenRegister}
        onSwitchToLogin={(isAdmin) => {
          setAuthIsAdmin(isAdmin);
          setAuthIsRegister(false);
        }}
      />
    </div>
  );
}
