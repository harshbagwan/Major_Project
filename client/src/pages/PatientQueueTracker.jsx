import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import {
  Ticket,
  Clock,
  User,
  MapPin,
  Stethoscope,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  BellRing,
  ArrowRight
} from 'lucide-react';

export const PatientQueueTracker = ({ initialTokenNumber = '104' }) => {
  const [tokenInput, setTokenInput] = useState(String(initialTokenNumber || '104'));
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { queueTick } = useSocket();

  useEffect(() => {
    if (tokenInput) {
      fetchTokenStatus(tokenInput);
    }
  }, [queueTick]);

  const fetchTokenStatus = async (identifier) => {
    if (!identifier) return;
    setLoading(true);
    setError('');

    try {
      const data = await api.getTokenStatus(identifier.trim());
      setTokenData(data);
    } catch (err) {
      setError(err.message || 'Token not found. Please verify your token number.');
      setTokenData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTokenStatus(tokenInput);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Search Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Ticket size={14} /> Live OPD Status
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Track Your Live Queue Position
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Instant real-time token tracking. No waiting in crowded waiting rooms — monitor your spot from your phone or clinic cafeteria.
        </p>

        {/* Token Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mt-6">
          <input
            type="text"
            placeholder="Enter Token (e.g. 104 or T-104)"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="py-3 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-lg shadow-cyan-900/40 flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Track</span>
          </button>
        </form>

        {/* Quick Demo Token Suggestions */}
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400">
          <span>Try Demo Tokens:</span>
          {['103', '104', '105', '107'].map((tok) => (
            <button
              key={tok}
              type="button"
              onClick={() => {
                setTokenInput(tok);
                fetchTokenStatus(tok);
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-[11px] border border-slate-700"
            >
              #{tok}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="max-w-md mx-auto p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs text-center mb-6">
          {error}
        </div>
      )}

      {tokenData && (
        <div className="space-y-6">
          {/* Main Status Hero Card */}
          <div className={`glass-panel p-6 sm:p-8 relative overflow-hidden transition-all ${
            tokenData.token.status === 'serving'
              ? 'border-emerald-500/60 bg-emerald-950/20 shadow-2xl shadow-emerald-950/40'
              : tokenData.tokensAhead === 1
              ? 'border-amber-500/60 bg-amber-950/20 shadow-2xl shadow-amber-950/40'
              : 'border-cyan-500/40'
          }`}>
            {/* Top Status Pill */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Patient Token Slip
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  tokenData.token.status === 'serving'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                    : tokenData.tokensAhead === 1
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}>
                  {tokenData.token.status === 'serving' ? '● Serving Now Inside' : tokenData.token.status === 'completed' ? '✓ Completed' : '● In Live Queue'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock size={14} className="text-cyan-400" />
                <span>Checked In: {new Date(tokenData.token.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Proximity Call Alert Banner */}
            {tokenData.tokensAhead <= 2 && tokenData.token.status === 'waiting' && (
              <div className="my-5 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 font-bold">
                  <BellRing size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-amber-300">
                    {tokenData.tokensAhead === 1 ? 'You are NEXT in line!' : 'Your turn is approaching!'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Please make your way towards <strong>{tokenData.token.roomNumber}</strong>. Your consultation will begin shortly.
                  </p>
                </div>
              </div>
            )}

            {/* Serving Now Hero Display */}
            {tokenData.token.status === 'serving' && (
              <div className="my-5 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-cyan-500/30 border border-emerald-400/50 flex items-center justify-between animate-pulse-glow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold text-xl shadow-lg">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">Doctor Ready</span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white">
                      Please enter {tokenData.token.roomNumber} now!
                    </h3>
                    <p className="text-xs text-slate-300">{tokenData.doctor?.name} is ready to see you.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Token & Queue Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8 text-center">
              {/* Your Token */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-inner">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Your Token
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono text-cyan-400 mt-2">
                  {tokenData.token.displayToken}
                </div>
                <p className="text-xs text-slate-300 mt-1 font-semibold">{tokenData.token.patientName}</p>
              </div>

              {/* Current Serving */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Currently Serving
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 mt-2">
                  {tokenData.currentServing ? tokenData.currentServing.displayToken : 'None'}
                </div>
                <p className="text-xs text-slate-400 mt-1">In Doctor's Room</p>
              </div>

              {/* People Ahead & Wait Time */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Estimated Wait Time
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono text-amber-400 mt-2">
                  ~{tokenData.estimatedWaitMins} <span className="text-lg font-sans font-semibold text-slate-400">mins</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  <strong>{tokenData.tokensAhead}</strong> patient(s) ahead of you
                </p>
              </div>
            </div>

            {/* Doctor & Room Info Box */}
            <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {tokenData.doctor?.avatarUrl && (
                  <img
                    src={tokenData.doctor.avatarUrl}
                    alt={tokenData.doctor.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                  />
                )}
                <div>
                  <h4 className="font-bold text-sm text-white">{tokenData.doctor?.name}</h4>
                  <p className="text-xs text-cyan-400 font-medium">{tokenData.doctor?.specialization}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Consultation Room</span>
                <p className="font-mono font-bold text-sm text-white">{tokenData.token.roomNumber}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
