import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Activity,
  Calendar,
  Ticket,
  Tv,
  Users,
  Stethoscope,
  BarChart3,
  Volume2,
  VolumeX,
  RotateCcw,
  UserCheck,
  ChevronDown,
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, clinic }) => {
  const { isConnected, isAudioMuted, toggleSound, testChime } = useSocket();
  const { user, loginAsReceptionist, loginAsDoctor, logout } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleResetData = async () => {
    if (confirm('Reset system with fresh realistic pilot clinic data?')) {
      setResetting(true);
      try {
        await api.resetDemoData();
      } catch (err) {
        console.error('Reset failed:', err);
      } finally {
        setResetting(false);
      }
    }
  };

  const navItems = [
    { id: 'book', label: 'Book Appointment', icon: Calendar, badge: null },
    { id: 'track', label: 'Track Live Queue', icon: Ticket, badge: 'Live' },
    { id: 'tv', label: 'Waiting Room TV', icon: Tv, badge: 'Signage' },
    { id: 'reception', label: 'Reception Desk', icon: Users, badge: null },
    { id: 'doctor', label: 'Doctor OPD Desk', icon: Stethoscope, badge: null },
    { id: 'analytics', label: 'Analytics & Viva Report', icon: BarChart3, badge: 'KPI' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
      {/* Top Advisory Banner */}
      <div className="bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 py-1 px-4 text-center border-b border-white/5 text-[11px] text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2 mx-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span className="font-semibold text-cyan-300">12-Week Pilot Architecture</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 truncate max-w-lg">{clinic?.activeNotice || 'OPD Queue Active. Emergency and Senior patients are prioritized.'}</span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            {isConnected ? (
              <span className="text-emerald-400 flex items-center gap-1 font-mono"><Wifi size={11} /> 100% Real-time</span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1 font-mono"><WifiOff size={11} /> Reconnecting</span>
            )}
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand & Clinic Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('book')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-950/60 border border-cyan-400/30">
            <Activity className="text-white" size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                Apollo Care
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
                Smart OPD
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs font-normal">
              {clinic?.tagline || 'Hospital Appointment & Real-Time Queue Management'}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all relative ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/50 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon size={15} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* Audio Chime Controller */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={toggleSound}
              title={isAudioMuted ? 'Unmute Audio Chime' : 'Mute Audio Chime'}
              className={`p-1.5 rounded-md text-xs transition ${
                isAudioMuted ? 'text-rose-400 bg-rose-950/30' : 'text-cyan-400 hover:bg-slate-800'
              }`}
            >
              {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
              onClick={testChime}
              title="Test Hospital Chime Sound"
              className="text-[10px] font-semibold text-slate-300 hover:text-white px-2 py-1 hover:bg-slate-800 rounded transition hidden sm:inline-block"
            >
              Test Chime
            </button>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={handleResetData}
            disabled={resetting}
            title="Reset with realistic demo traffic"
            className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-800 transition disabled:opacity-50"
          >
            <RotateCcw size={13} className={resetting ? 'animate-spin text-cyan-400' : ''} />
            <span className="hidden md:inline">Reset Demo</span>
          </button>

          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-800 transition"
            >
              <UserCheck size={14} className="text-cyan-400" />
              <span className="truncate max-w-[90px] sm:max-w-none">
                {user ? user.name : 'Guest Patient'}
              </span>
              <ChevronDown size={13} className="text-slate-500" />
            </button>

            {roleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-scale-in"
                onClick={() => setRoleDropdownOpen(false)}
              >
                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Quick Demo Switcher
                </div>

                <div className="py-1 space-y-1">
                  <button
                    onClick={() => {
                      loginAsReceptionist();
                      setActiveTab('reception');
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-slate-800 text-slate-200"
                  >
                    <span>👩‍💼</span>
                    <div>
                      <p className="font-semibold text-white">Reception Desk</p>
                      <p className="text-[10px] text-slate-400">Sunita Sharma</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      loginAsDoctor('doc-1');
                      setActiveTab('doctor');
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-slate-800 text-slate-200"
                  >
                    <span>👨‍⚕️</span>
                    <div>
                      <p className="font-semibold text-white">Dr. Rajesh Sharma</p>
                      <p className="text-[10px] text-slate-400">Room 101 - Cardiology</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      loginAsDoctor('doc-2');
                      setActiveTab('doctor');
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-slate-800 text-slate-200"
                  >
                    <span>👩‍⚕️</span>
                    <div>
                      <p className="font-semibold text-white">Dr. Priya Patel</p>
                      <p className="text-[10px] text-slate-400">Room 102 - Gen Medicine</p>
                    </div>
                  </button>
                </div>

                {user && (
                  <div className="border-t border-slate-800 pt-1 mt-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/30"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-3 py-2 bg-slate-900/60 border-t border-slate-800/60">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white bg-slate-800/40'
              }`}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
