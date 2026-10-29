import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { User as UserType } from '../types';

interface AuthModalsProps {
  isOpen: boolean;
  isAdminMode: boolean;
  isRegisterMode: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
  onSwitchToRegister: () => void;
  onSwitchToLogin: (isAdmin: boolean) => void;
}

export const AuthModals: React.FC<AuthModalsProps> = ({
  isOpen,
  isAdminMode,
  isRegisterMode,
  onClose,
  onSuccess,
  onSwitchToRegister,
  onSwitchToLogin,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!name || !email || !password) {
          throw new Error('Please fill all required fields');
        }
        const res = await api.register({ name, email, phone, password });
        setSuccessMsg('Registration successful! Redirecting to passenger dashboard...');
        setTimeout(() => {
          onSuccess(res.user);
          onClose();
        }, 800);
      } else if (isAdminMode) {
        const res = await api.adminLogin({ email, password });
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.login({ email, password });
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@smartroute.ai');
    setPassword('Admin@123');
    setError(null);
  };

  const fillDemoPassenger = () => {
    setEmail('passenger@smartroute.ai');
    setPassword('Pass@123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <div className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg ${
            isAdminMode 
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-indigo-500/20' 
              : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/20'
          }`}>
            {isAdminMode ? <ShieldCheck className="w-6 h-6" /> : isRegisterMode ? <User className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">
            {isAdminMode ? 'Administrator Portal' : isRegisterMode ? 'Passenger Registration' : 'Passenger Login'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isAdminMode 
              ? 'Secure authorization for transport planners & district authorities' 
              : isRegisterMode 
              ? 'Create your passenger account to search routes and log travel check-ins'
              : 'Sign in to access your personal travel history and trip bookings'}
          </p>
        </div>

        {/* Quick Demo Credentials Pill */}
        <div className="mb-5 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs flex items-center justify-between">
          <div className="text-[11px]">
            <span className="text-slate-400 block font-mono">Evaluation Quick Fill:</span>
            <span className="text-slate-200 font-semibold">{isAdminMode ? 'admin@smartroute.ai' : 'passenger@smartroute.ai'}</span>
          </div>
          <button
            type="button"
            onClick={isAdminMode ? fillDemoAdmin : fillDemoPassenger}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
              isAdminMode 
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 hover:bg-indigo-600/50' 
                : 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/50'
            }`}
          >
            Auto-Fill
          </button>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                placeholder={isAdminMode ? 'admin@smartroute.ai' : 'passenger@gmail.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
                  isAdminMode ? 'focus:ring-indigo-500' : 'focus:ring-emerald-500'
                }`}
              />
            </div>
          </div>

          {isRegisterMode && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+91 98400 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
                  isAdminMode ? 'focus:ring-indigo-500' : 'focus:ring-emerald-500'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
              isAdminMode
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isAdminMode ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                Authorize Administrator
              </>
            ) : isRegisterMode ? (
              'Create Passenger Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer Mode Switchers */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center space-y-2 text-xs text-slate-400">
          {!isAdminMode && !isRegisterMode && (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Register as Passenger
              </button>
            </p>
          )}

          {!isAdminMode && isRegisterMode && (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => onSwitchToLogin(false)}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Sign in to Passenger Account
              </button>
            </p>
          )}

          <div className="pt-2">
            {isAdminMode ? (
              <button
                type="button"
                onClick={() => onSwitchToLogin(false)}
                className="text-slate-400 hover:text-emerald-400 transition-colors"
              >
                Switch to Passenger Login
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSwitchToLogin(true)}
                className="text-slate-400 hover:text-indigo-400 transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Switch to Separate Admin Portal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
