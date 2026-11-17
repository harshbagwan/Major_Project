import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { OnlineUsersModal } from './OnlineUsersModal';
import { LoginModal } from './LoginModal';
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
  LogOut,
  LogIn,
  Shield,
  Sparkles
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, clinic }) => {
  const { isConnected, isAudioMuted, toggleSound, testChime, onlineUsers } = useSocket();
  const {
    user,
    role,
    isAdmin,
    isDoctor,
    isReceptionist,
    isPatient,
    isAuthenticated,
    canAccessTab,
    logout,
    loginModalOpen,
    openLoginModal,
    closeLoginModal
  } = useAuth();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [onlineUsersModalOpen, setOnlineUsersModalOpen] = useState(false);
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

  // All potential nav items
  const allNavItems = [
    { id: 'book', label: 'Book Appointment', icon: Calendar, minRole: 'patient' },
    { id: 'track', label: 'Live Queue Status', icon: Ticket, minRole: 'patient' },
    { id: 'tv', label: 'Waiting Room Screen', icon: Tv, minRole: 'patient' },
    { id: 'reception', label: 'Reception Desk', icon: Users, minRole: 'receptionist' },
    { id: 'doctor', label: 'Doctor Desk', icon: Stethoscope, minRole: 'doctor' },
    { id: 'analytics', label: 'Reports & Viva', icon: BarChart3, minRole: 'admin' }
  ];

  // Filter navigation items strictly based on authenticated role
  const visibleNavItems = allNavItems.filter(item => {
    if (isAdmin) return true; // Admin gets access to all portals
    if (isDoctor) return item.id === 'doctor' || item.id === 'tv';
    if (isReceptionist) return item.id === 'reception' || item.id === 'tv';
    // Patient or unauthenticated guest:
    return item.id === 'book' || item.id === 'track' || item.id === 'tv';
  });

  const getRoleBadge = (userRole) => {
    switch (userRole) {
      case 'admin':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Admin</span>;
      case 'doctor':
        return <span className="bg-teal-100 text-teal-800 border border-teal-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Doctor</span>;
      case 'receptionist':
        return <span className="bg-sky-100 text-sky-800 border border-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Reception</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Patient</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
      {/* Top Advisory Banner */}
      <div className="bg-teal-50 border-b border-teal-100/70 py-1.5 px-4 text-xs text-teal-900 flex items-center justify-between">
        <div className="flex items-center gap-2 mx-auto font-medium">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse inline-block" />
          <span className="font-semibold text-teal-800">OPD Queue Online</span>
          <span className="text-teal-300">|</span>
          <span className="text-teal-700 truncate max-w-md sm:max-w-xl">
            {clinic?.activeNotice || 'Emergency and Senior citizen patients are prioritized.'}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] text-teal-700">
          <span className="flex items-center gap-1 font-mono">
            {isConnected ? (
              <span className="text-teal-700 flex items-center gap-1"><Wifi size={12} /> WebSocket Live</span>
            ) : (
              <span className="text-rose-600 flex items-center gap-1"><WifiOff size={12} /> Reconnecting</span>
            )}
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand & Clinic Title */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => {
            if (isAdmin) setActiveTab('analytics');
            else if (isDoctor) setActiveTab('doctor');
            else if (isReceptionist) setActiveTab('reception');
            else setActiveTab('book');
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Activity size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                MediQ
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                Healthcare
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-[180px] sm:max-w-xs font-normal">
              {clinic?.name || 'Smart Hospital & Queue Management'}
            </p>
          </div>
        </div>

        {/* Role-Filtered Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
          {visibleNavItems.map((item) => {
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
          {/* Live Online Presence Pill */}
          <button
            onClick={() => setOnlineUsersModalOpen(true)}
            title="Click to view online staff and active patients"
            className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-medium transition shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span className="font-bold font-mono">{onlineUsers.length}</span>
            <span className="hidden sm:inline">Online</span>
          </button>

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
              Chime
            </button>
          </div>

          {/* User Account / Role Widget */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 border border-slate-200 shadow-xs transition"
              >
                <span className="text-base">{user.avatar || '🧑'}</span>
                <div className="text-left hidden sm:block">
                  <span className="block truncate max-w-[110px] leading-tight font-bold">{user.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-slate-500 capitalize">{user.role}</span>
                </div>
                {getRoleBadge(user.role)}
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-lg p-2.5 z-50 text-slate-800 animate-slide-up"
                  onClick={() => setRoleDropdownOpen(false)}
                >
                  <div className="p-2 bg-slate-50 rounded-lg mb-2 border border-slate-100">
                    <p className="font-bold text-xs text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{user.email || user.phone}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {getRoleBadge(user.role)}
                      <span className="text-[10px] text-emerald-700 font-medium">● Signed In</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => openLoginModal()}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-slate-50 text-slate-700 font-medium transition"
                    >
                      <UserCheck size={14} className="text-teal-600" />
                      <span>Switch Role / Sign In Another User</span>
                    </button>

                    <button
                      onClick={logout}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 font-semibold transition"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openLoginModal()}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition shadow-xs"
            >
              <LogIn size={14} />
              <span>Sign In / Roles</span>
            </button>
          )}

          {/* Reset Demo Data Button */}
          <button
            onClick={handleResetData}
            disabled={resetting}
            title="Reset system with sample hospital data"
            className="flex items-center gap-1.5 py-2 px-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-500 text-xs border border-slate-200 transition shadow-2xs disabled:opacity-50"
          >
            <RotateCcw size={13} className={resetting ? 'animate-spin text-teal-600' : 'text-slate-400'} />
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-3 py-2 bg-slate-50 border-t border-slate-200">
        {visibleNavItems.map((item) => {
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

      {/* Live Online Users Modal */}
      <OnlineUsersModal
        isOpen={onlineUsersModalOpen}
        onClose={() => setOnlineUsersModalOpen(false)}
      />

      {/* Role-Based Authentication & Registration Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={closeLoginModal}
        onLoginSuccess={(loggedUser, nextTab) => {
          if (nextTab) {
            setActiveTab(nextTab);
          } else if (loggedUser.role === 'admin') {
            setActiveTab('analytics');
          } else if (loggedUser.role === 'doctor') {
            setActiveTab('doctor');
          } else if (loggedUser.role === 'receptionist') {
            setActiveTab('reception');
          } else {
            setActiveTab('book');
          }
        }}
      />
    </header>
  );
};
