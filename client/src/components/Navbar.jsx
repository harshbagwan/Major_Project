import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
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
  Activity,
  Wifi,
  WifiOff,
  Building2
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, clinic }) => {
  const { isConnected, isAudioMuted, toggleSound, testChime } = useSocket();
  const { user, loginAsReceptionist, loginAsDoctor, logout } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleResetData = async () => {
    if (confirm('Reset system with fresh clinic demo data?')) {
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
    { id: 'book', label: 'Book Appointment', icon: Calendar },
    { id: 'track', label: 'Live Queue Status', icon: Ticket },
    { id: 'tv', label: 'Waiting Room Screen', icon: Tv },
    { id: 'reception', label: 'Reception Desk', icon: Users },
    { id: 'doctor', label: 'Doctor Desk', icon: Stethoscope },
    { id: 'analytics', label: 'Reports', icon: BarChart3 }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
      {/* Top Advisory Banner */}
      <div className="bg-teal-50 border-b border-teal-100/70 py-1.5 px-4 text-xs text-teal-900 flex items-center justify-between">
        <div className="flex items-center gap-2 mx-auto font-medium">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse inline-block" />
          <span className="font-semibold text-teal-800">OPD Queue Active</span>
          <span className="text-teal-300">|</span>
          <span className="text-teal-700 truncate max-w-md sm:max-w-xl">
            {clinic?.activeNotice || 'Emergency and Senior citizen patients are given priority.'}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] text-teal-700">
          <span className="flex items-center gap-1 font-mono">
            {isConnected ? (
              <span className="text-teal-700 flex items-center gap-1"><Wifi size={12} /> Live Connected</span>
            ) : (
              <span className="text-rose-600 flex items-center gap-1"><WifiOff size={12} /> Reconnecting</span>
            )}
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand & Clinic Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('book')}>
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
            <Activity size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                MediQ
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                OPD Care
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs font-normal">
              {clinic?.name || 'Smart Hospital & Queue Management'}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs transition-all ${
                  isActive
                    ? 'bg-white text-teal-800 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-teal-600' : 'text-slate-500'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* Audio Chime Controller */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-xs">
            <button
              onClick={toggleSound}
              title={isAudioMuted ? 'Unmute Bell' : 'Mute Bell'}
              className={`p-1.5 rounded-md text-xs transition ${
                isAudioMuted ? 'text-rose-500 bg-rose-50' : 'text-teal-700 hover:bg-slate-100'
              }`}
            >
              {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
              onClick={testChime}
              title="Test Chime Sound"
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-0.5 hover:bg-slate-100 rounded transition hidden sm:inline-block"
            >
              Test Chime
            </button>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={handleResetData}
            disabled={resetting}
            title="Reset with sample hospital data"
            className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs border border-slate-200 transition shadow-xs disabled:opacity-50"
          >
            <RotateCcw size={13} className={resetting ? 'animate-spin text-teal-600' : 'text-slate-500'} />
            <span className="hidden md:inline font-medium">Reset Demo</span>
          </button>

          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 shadow-xs transition"
            >
              <UserCheck size={14} className="text-teal-600" />
              <span className="truncate max-w-[100px] sm:max-w-none">
                {user ? user.name : 'Patient View'}
              </span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-lg p-2 z-50 text-slate-800"
                onClick={() => setRoleDropdownOpen(false)}
              >
                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Switch Demo View
                </div>

                <div className="py-1 space-y-1">
                  <button
                    onClick={() => {
                      loginAsReceptionist();
                      setActiveTab('reception');
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-slate-50 text-slate-800 transition"
                  >
                    <span className="text-base">👩‍💼</span>
                    <div>
                      <p className="font-semibold text-slate-900">Reception Desk</p>
                      <p className="text-[11px] text-slate-500">Sunita Sharma</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      loginAsDoctor('doc-1');
                      setActiveTab('doctor');
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-slate-50 text-slate-800 transition"
                  >
                    <span className="text-base">👨‍⚕️</span>
                    <div>
                      <p className="font-semibold text-slate-900">Dr. Rajesh Sharma</p>
                      <p className="text-[11px] text-slate-500">Room 101 • Cardiology</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      loginAsDoctor('doc-2');
                      setActiveTab('doctor');
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-slate-50 text-slate-800 transition"
                  >
                    <span className="text-base">👩‍⚕️</span>
                    <div>
                      <p className="font-semibold text-slate-900">Dr. Priya Patel</p>
                      <p className="text-[11px] text-slate-500">Room 102 • Medicine</p>
                    </div>
                  </button>
                </div>

                {user && (
                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 font-medium transition"
                    >
                      Return to Patient View
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-3 py-2 bg-slate-50 border-t border-slate-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-teal-600 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
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
