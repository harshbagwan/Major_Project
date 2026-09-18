import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { soundController } from '../components/AudioChime';
import {
  Tv,
  Clock,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sparkles,
  Users,
  Stethoscope,
  Activity,
  BellRing
} from 'lucide-react';

export const WaitingRoomTVPage = ({ clinic }) => {
  const [doctors, setDoctors] = useState([]);
  const [queueTokens, setQueueTokens] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { latestCalledToken, queueTick, isAudioMuted, toggleSound, testChime } = useSocket();

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [queueTick]);

  const loadData = async () => {
    try {
      const [docRes, queueRes] = await Promise.all([
        api.getDoctors(),
        api.getQueue()
      ]);
      setDoctors(docRes.doctors || []);
      setQueueTokens(queueRes.tokens || []);
    } catch (err) {
      console.error('Failed to load TV data:', err);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // Find active serving tokens across doctors
  const servingTokens = queueTokens.filter(t => t.status === 'serving' || t.status === 'called');
  const waitingTokens = queueTokens.filter(t => t.status === 'waiting');

  return (
    <div className={`min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 select-none ${
      isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto' : ''
    }`}>
      {/* TV Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-950/80">
            <Activity size={26} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                {clinic?.name || 'Apollo Care Health Clinic'}
              </h1>
              <span className="bg-rose-500/20 text-rose-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-500/30 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block" /> Live Display
              </span>
            </div>
            <p className="text-xs text-slate-400">Digital OPD Queue & Patient Call Board</p>
          </div>
        </div>

        {/* Live Clock & Fullscreen Control */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-2xl font-black font-mono tracking-tight text-cyan-400">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
              {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              title={isAudioMuted ? 'Unmute Chime' : 'Mute Chime'}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            >
              {isAudioMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-cyan-400" />}
            </button>
            <button
              onClick={testChime}
              title="Test Chime Sound"
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-cyan-400 border border-slate-800 transition"
            >
              Test Chime
            </button>
            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen TV Mode"
              className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-lg shadow-cyan-900/40"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Doctors & Their Current Serving Tokens */}
      <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {doctors.map((doc) => {
          // Find token currently serving with this doctor
          const currentToken = servingTokens.find(t => t.doctorId === doc.id);
          const isLatestCalled = latestCalledToken?.token?.id === currentToken?.id;

          return (
            <div
              key={doc.id}
              className={`glass-panel p-6 rounded-2xl flex flex-col justify-between transition-all duration-500 ${
                isLatestCalled
                  ? 'border-cyan-400 bg-cyan-950/30 ring-2 ring-cyan-400/50 animate-pulse-glow'
                  : currentToken
                  ? 'border-slate-700 bg-slate-900/90'
                  : 'border-slate-800/60 bg-slate-900/40 opacity-80'
              }`}
            >
              {/* Doctor Header */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
                <img
                  src={doc.avatarUrl}
                  alt={doc.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shadow-md"
                />
                <div>
                  <h3 className="font-extrabold text-base text-white">{doc.name}</h3>
                  <p className="text-xs font-semibold text-cyan-400">{doc.specialization}</p>
                  <span className="inline-block text-[11px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded mt-1">
                    📍 {doc.roomNumber}
                  </span>
                </div>
              </div>

              {/* Huge Now Serving Token Card */}
              <div className="my-8 text-center">
                <span className="text-xs uppercase tracking-widest font-extrabold text-slate-400 flex items-center justify-center gap-1.5">
                  <BellRing size={13} className="text-emerald-400" /> Now Serving
                </span>

                {currentToken ? (
                  <div className="mt-3">
                    <div className="inline-block py-2 px-6 rounded-2xl bg-slate-950 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950/60">
                      <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-emerald-400">
                        {currentToken.displayToken}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white mt-3">
                      {currentToken.patientName}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Proceed to {doc.roomNumber}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 py-6 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-slate-500 font-mono text-sm">
                    Waiting for next call...
                  </div>
                )}
              </div>

              {/* Waiting count for this doctor */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>Waiting in this OPD:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {waitingTokens.filter(t => t.doctorId === doc.id).length} Patients
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Up Tokens Ticker Box */}
      <div className="glass-panel p-4 rounded-2xl border-slate-800 bg-slate-900/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 flex items-center gap-1.5">
              <Users size={14} /> Upcoming in Line (Please Be Ready)
            </span>
            <span className="text-[10px] font-mono text-slate-400">({waitingTokens.length} waiting)</span>
          </div>
          <span className="text-xs text-slate-400 italic">
            Please watch your mobile phone for SMS / WhatsApp alerts
          </span>
        </div>

        {waitingTokens.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">No patients currently in waiting line.</p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {waitingTokens.slice(0, 10).map((tok, idx) => (
              <div
                key={tok.id}
                className={`py-2 px-3 rounded-xl border flex items-center gap-2 font-mono ${
                  idx === 0
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <span className="text-xs font-black">{tok.displayToken}</span>
                <span className="text-[10px] text-slate-400 font-sans truncate max-w-[90px]">
                  {tok.patientName}
                </span>
                <span className="text-[10px] text-cyan-400 font-sans">({tok.roomNumber.split(' ')[0]})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Emergency / Advisory Scrolling Ticker */}
      <div className="mt-4 py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-500/20 text-xs text-slate-300 flex items-center gap-3">
        <span className="bg-cyan-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider flex-shrink-0">
          ANNOUNCEMENT
        </span>
        <marquee className="font-medium text-slate-200">
          {clinic?.activeNotice || 'Welcome to Apollo Care Health Clinic. Please have your token slip or digital phone pass ready. Free Wi-Fi is available in the waiting lobby. Emergency cases are prioritized.'}
        </marquee>
      </div>
    </div>
  );
};
