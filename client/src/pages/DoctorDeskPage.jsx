import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope,
  Volume2,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  FileText,
  Pill,
  HeartPulse,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Flame,
  Check
} from 'lucide-react';

export const DoctorDeskPage = () => {
  const { user } = useAuth();
  const { queueTick } = useSocket();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('doc-1');
  const [queueTokens, setQueueTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Clinical Notes & Rx State
  const [clinicalNotes, setClinicalNotes] = useState({
    diagnosis: '',
    prescription: '',
    bp: '120/80',
    pulse: '74',
    temp: '98.6',
    notes: '',
    followUpDate: ''
  });

  const [activeTab, setActiveTab] = useState('active'); // 'active', 'history'

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctorId) {
      loadQueue(selectedDoctorId);
    }
  }, [selectedDoctorId, queueTick]);

  // If logged in as a specific doctor, auto-select their ID
  useEffect(() => {
    if (user?.role === 'doctor' && user?.doctorId) {
      setSelectedDoctorId(user.doctorId);
    }
  }, [user]);

  const loadDoctors = async () => {
    try {
      const data = await api.getDoctors();
      setDoctors(data.doctors || []);
      if (data.doctors?.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(data.doctors[0].id);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
    }
  };

  const loadQueue = async (docId) => {
    try {
      setLoading(true);
      const data = await api.getQueue({ doctorId: docId });
      setQueueTokens(data.tokens || []);
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];
  const servingToken = queueTokens.find(t => t.status === 'serving' || t.status === 'called');
  const waitingTokens = queueTokens.filter(t => t.status === 'waiting');
  const completedTokens = queueTokens.filter(t => t.status === 'completed');

  const handleCallNext = async (specificTokenId = null) => {
    try {
      setActionLoading(true);
      await api.callNextToken(selectedDoctorId, specificTokenId);
      // Reset clinical notes for next patient
      setClinicalNotes({
        diagnosis: '',
        prescription: '',
        bp: '120/80',
        pulse: '74',
        temp: '98.6',
        notes: '',
        followUpDate: ''
      });
    } catch (err) {
      alert(err.message || 'Failed to call next patient');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecall = async () => {
    if (!servingToken) return;
    try {
      await api.recallToken(servingToken.id);
    } catch (err) {
      alert(err.message || 'Recall failed');
    }
  };

  const handleCompleteConsultation = async () => {
    if (!servingToken) return;
    try {
      setActionLoading(true);
      await api.completeToken({
        tokenId: servingToken.id,
        diagnosis: clinicalNotes.diagnosis || 'Routine Checkup Completed',
        prescription: clinicalNotes.prescription,
        vitals: {
          bp: clinicalNotes.bp,
          pulse: clinicalNotes.pulse,
          temp: clinicalNotes.temp
        },
        notes: clinicalNotes.notes,
        followUpDate: clinicalNotes.followUpDate
      });

      // Clear notes
      setClinicalNotes({
        diagnosis: '',
        prescription: '',
        bp: '120/80',
        pulse: '74',
        temp: '98.6',
        notes: '',
        followUpDate: ''
      });
    } catch (err) {
      alert(err.message || 'Failed to complete consultation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkNoShow = async () => {
    if (!servingToken) return;
    if (confirm(`Mark Token ${servingToken.displayToken} (${servingToken.patientName}) as Absent / No-Show?`)) {
      try {
        await api.markNoShow(servingToken.id);
      } catch (err) {
        alert(err.message || 'Failed to mark no show');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header with Doctor Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Doctor OPD Consultation Desk
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Clinical Workspace
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Call patients into your consultation room, ring the waiting room TV chime, and record prescriptions.
          </p>
        </div>

        {/* Doctor OPD Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 px-2">Active Doctor:</span>
          {doctors.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDoctorId(d.id)}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedDoctorId === d.id
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{d.name.split(' ')[1]}</span>
              <span className="text-[10px] font-mono opacity-80">({d.roomNumber.split(' ')[0]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Currently Serving Patient & Consultation Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Serving Hero Card */}
          <div className={`glass-panel p-6 sm:p-8 transition-all ${
            servingToken
              ? 'border-emerald-500/50 bg-emerald-950/20 shadow-2xl'
              : 'border-slate-800 bg-slate-900/40'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Stethoscope size={16} className="text-cyan-400" /> Currently In Consultation
              </span>
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                {currentDoctor?.roomNumber}
              </span>
            </div>

            {servingToken ? (
              <div className="my-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-widest font-mono font-bold text-slate-400">
                      Token Number
                    </span>
                    <div className="text-4xl font-black font-mono text-emerald-400 mt-1">
                      {servingToken.displayToken}
                    </div>
                    <h2 className="text-xl font-bold text-white mt-1">
                      {servingToken.patientName}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Phone: {servingToken.patientPhone} • {servingToken.patientAge || 'N/A'} yrs • {servingToken.patientGender}
                    </p>
                  </div>

                  {/* Consultation Time / Wait Time */}
                  <div className="text-left sm:text-right bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Patient Wait Time:</span>
                    <span className="font-mono font-bold text-amber-400 text-base">
                      {servingToken.waitTimeMinutes || 12} mins
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Reason: <strong className="text-slate-300">{servingToken.reason || 'General Checkup'}</strong>
                    </span>
                  </div>
                </div>

                {/* Consultation Actions Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-6">
                  <button
                    onClick={handleRecall}
                    title="Ring chime and announce again on Waiting Room TV"
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold transition border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <Volume2 size={15} /> Re-Ring Chime
                  </button>

                  <button
                    onClick={handleMarkNoShow}
                    title="Mark patient as absent"
                    className="py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 text-xs font-bold transition border border-rose-800/40 flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={15} /> Mark No-Show
                  </button>

                  <button
                    onClick={handleCompleteConsultation}
                    disabled={actionLoading}
                    className="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={15} /> Complete & Next
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
                  <User size={30} />
                </div>
                <h3 className="text-base font-bold text-white">No Patient Currently Inside</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Click the button below to call the next patient in line. The waiting room TV will chime and announce their token.
                </p>

                <button
                  onClick={() => handleCallNext()}
                  disabled={waitingTokens.length === 0 || actionLoading}
                  className="mt-6 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-950/60 disabled:opacity-40 inline-flex items-center gap-2"
                >
                  <Volume2 size={16} />
                  <span>Call Next Patient in Queue ({waitingTokens.length} Waiting)</span>
                </button>
              </div>
            )}
          </div>

          {/* Clinical Prescription & Diagnosis Form */}
          {servingToken && (
            <div className="glass-panel p-6 sm:p-8 space-y-4 border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 pb-3 border-b border-slate-800">
                <FileText size={16} className="text-cyan-400" /> Patient Medical Notes & Prescription
              </h3>

              {/* Patient Vitals */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={clinicalNotes.bp}
                    onChange={(e) => setClinicalNotes(prev => ({ ...prev, bp: e.target.value }))}
                    placeholder="120/80"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pulse (bpm)</label>
                  <input
                    type="text"
                    value={clinicalNotes.pulse}
                    onChange={(e) => setClinicalNotes(prev => ({ ...prev, pulse: e.target.value }))}
                    placeholder="74"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Temp (°F)</label>
                  <input
                    type="text"
                    value={clinicalNotes.temp}
                    onChange={(e) => setClinicalNotes(prev => ({ ...prev, temp: e.target.value }))}
                    placeholder="98.6"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Clinical Diagnosis</label>
                <input
                  type="text"
                  value={clinicalNotes.diagnosis}
                  onChange={(e) => setClinicalNotes(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="e.g. Mild Angina, Viral Upper Respiratory Tract Infection, Diabetes Type 2"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Prescription / Medicines */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Prescribed Medicines & Dosage</label>
                <textarea
                  rows={3}
                  value={clinicalNotes.prescription}
                  onChange={(e) => setClinicalNotes(prev => ({ ...prev, prescription: e.target.value }))}
                  placeholder="1. Tab Paracetamol 650mg - 1 stat, then SOS&#10;2. Tab Amoxicillin 500mg - 1-0-1 x 5 days"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Notes & Follow-up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Special Advice / Lab Tests</label>
                  <input
                    type="text"
                    value={clinicalNotes.notes}
                    onChange={(e) => setClinicalNotes(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="e.g. Fasting Lipid Profile, Complete Blood Count"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Follow-up Review Date</label>
                  <input
                    type="date"
                    value={clinicalNotes.followUpDate}
                    onChange={(e) => setClinicalNotes(prev => ({ ...prev, followUpDate: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCompleteConsultation}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} /> Save Prescription & Complete Consultation
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Doctor's Queue List & History (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Clock size={16} className="text-cyan-400" /> Waiting in Line ({waitingTokens.length})
            </h3>
            <button
              onClick={() => loadQueue(selectedDoctorId)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          <div className="space-y-2.5">
            {waitingTokens.length === 0 ? (
              <div className="glass-panel p-6 text-center text-slate-500 text-xs italic">
                All caught up! No waiting patients in this doctor's OPD.
              </div>
            ) : (
              waitingTokens.map((tok, idx) => {
                const isEmergency = tok.priorityLevel === 3;
                const isSenior = tok.priorityLevel === 2;

                return (
                  <div
                    key={tok.id}
                    className={`glass-card p-4 flex items-center justify-between gap-3 border ${
                      isEmergency
                        ? 'border-rose-500/40 bg-rose-950/20'
                        : isSenior
                        ? 'border-amber-500/40 bg-amber-950/20'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-mono font-black text-sm text-cyan-400 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                        {tok.displayToken}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-white">{tok.patientName}</h4>
                          {isEmergency && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-0.5">
                              <Flame size={10} /> URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                          {tok.reason || 'General Consultation'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCallNext(tok.id)}
                        title="Call this specific patient into room"
                        className="py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-md shadow-cyan-900/40"
                      >
                        Call
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Completed Consultations Summary */}
          <div className="glass-panel p-5 mt-6 border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Completed Today</span>
              <span className="font-mono text-emerald-400 font-bold">{completedTokens.length} Patients</span>
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {completedTokens.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No consultations finished today yet.</p>
              ) : (
                completedTokens.map(tok => (
                  <div key={tok.id} className="text-xs p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-300 mr-2">{tok.displayToken}</span>
                      <span className="text-slate-200 font-medium">{tok.patientName}</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400">
                      ✓ Done ({tok.serviceTimeMinutes || 8}m)
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
