import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { PrintTokenModal } from '../components/PrintTokenModal';
import {
  Users,
  UserPlus,
  CalendarCheck,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Search,
  RefreshCw,
  Phone,
  Stethoscope,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const ReceptionistDashboard = ({ clinic, onNavigateToTracker }) => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [queueTokens, setQueueTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'walkin', 'appointments'

  // Fast Walk-in Form State
  const [walkInData, setWalkInData] = useState({
    patientName: '',
    patientPhone: '',
    patientAge: '',
    patientGender: 'Male',
    doctorId: '',
    reason: '',
    isEmergency: false,
    isSenior: false
  });

  // Selected Token for Printing
  const [printedToken, setPrintedToken] = useState(null);

  const { queueTick } = useSocket();

  useEffect(() => {
    loadData();
  }, [queueTick]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docRes, aptRes, queueRes] = await Promise.all([
        api.getDoctors(),
        api.getAppointments(),
        api.getQueue()
      ]);
      setDoctors(docRes.doctors || []);
      setAppointments(aptRes.appointments || []);
      setQueueTokens(queueRes.tokens || []);

      if (docRes.doctors && docRes.doctors.length > 0 && !walkInData.doctorId) {
        setWalkInData(prev => ({ ...prev, doctorId: docRes.doctors[0].id }));
      }
    } catch (err) {
      console.error('Failed to load receptionist data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    if (!walkInData.patientName || !walkInData.patientPhone || !walkInData.doctorId) {
      alert('Please fill out patient name, phone, and select doctor.');
      return;
    }

    try {
      const res = await api.createWalkInToken(walkInData);
      setPrintedToken(res.token); // Open printable token modal

      // Reset form
      setWalkInData({
        patientName: '',
        patientPhone: '',
        patientAge: '',
        patientGender: 'Male',
        doctorId: doctors[0]?.id || '',
        reason: '',
        isEmergency: false,
        isSenior: false
      });
      setActiveTab('queue');
    } catch (err) {
      alert(err.message || 'Failed to issue walk-in token');
    }
  };

  const handleCheckInAppointment = async (aptId) => {
    try {
      const res = await api.checkInAppointment(aptId);
      setPrintedToken(res.token);
    } catch (err) {
      alert(err.message || 'Check-in failed');
    }
  };

  const handlePriorityToggle = async (tokenId, isEmergency, isSenior) => {
    try {
      await api.reorderPriority({ tokenId, isEmergency, isSenior });
    } catch (err) {
      alert(err.message || 'Failed to update priority');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Front Desk & Reception OPD
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Staff Portal
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate walk-in tokens in 5 seconds, check in online appointments, and manage patient priority queues.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'queue' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock size={15} />
            <span>Live Queue ({queueTokens.filter(t => t.status === 'waiting' || t.status === 'serving').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('walkin')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'walkin' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus size={15} />
            <span>Fast Walk-In</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'appointments' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarCheck size={15} />
            <span>Today's Bookings ({appointments.length})</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Doctors Quick Roster */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {doctors.map((doc) => {
              const docWaiting = queueTokens.filter(t => t.doctorId === doc.id && t.status === 'waiting').length;
              const docServing = queueTokens.find(t => t.doctorId === doc.id && (t.status === 'serving' || t.status === 'called'));

              return (
                <div key={doc.id} className="glass-panel p-4 flex items-center justify-between border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.avatarUrl}
                      alt={doc.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-white">{doc.name}</h4>
                      <p className="text-[11px] text-cyan-400">{doc.roomNumber.split(' ')[0]}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Serving</span>
                    <span className="font-mono font-black text-sm text-emerald-400">
                      {docServing ? docServing.displayToken : 'None'}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      ({docWaiting} waiting)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Queue Table */}
          <div className="glass-panel overflow-hidden border-slate-800">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock size={16} className="text-cyan-400" /> Active Clinic Queue Line
              </h3>
              <button
                onClick={loadData}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Token #</th>
                    <th className="px-5 py-3.5">Patient Details</th>
                    <th className="px-5 py-3.5">Assigned Doctor</th>
                    <th className="px-5 py-3.5">Type & Priority</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {queueTokens.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-500 italic">
                        No tokens generated today yet.
                      </td>
                    </tr>
                  ) : (
                    queueTokens.map((tok) => {
                      const doc = doctors.find(d => d.id === tok.doctorId);
                      const isEmergency = tok.priorityLevel === 3;
                      const isSenior = tok.priorityLevel === 2;

                      return (
                        <tr
                          key={tok.id}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            tok.status === 'serving'
                              ? 'bg-emerald-950/20'
                              : isEmergency
                              ? 'bg-rose-950/20'
                              : ''
                          }`}
                        >
                          <td className="px-5 py-3.5">
                            <span className="font-mono font-extrabold text-sm text-cyan-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                              {tok.displayToken}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="font-bold text-white">{tok.patientName}</div>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                              <span>{tok.patientPhone}</span>
                              {tok.patientAge && <span>• {tok.patientAge}y</span>}
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-slate-200">{doc?.name || 'Doctor'}</div>
                            <div className="text-[11px] text-slate-400">{tok.roomNumber}</div>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              {isEmergency ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                  <Flame size={11} /> EMERGENCY
                                </span>
                              ) : isSenior ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  SENIOR CITIZEN
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                                  {tok.tokenType === 'appointment' ? 'Appointment' : 'Regular Walk-in'}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              tok.status === 'serving'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                                : tok.status === 'completed'
                                ? 'bg-slate-800 text-slate-400'
                                : tok.status === 'no_show'
                                ? 'bg-rose-950/50 text-rose-400'
                                : 'bg-cyan-500/20 text-cyan-400'
                            }`}>
                              {tok.status === 'serving' ? 'Serving Inside' : tok.status}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {tok.status === 'waiting' && (
                                <button
                                  onClick={() => handlePriorityToggle(tok.id, !isEmergency, false)}
                                  title="Toggle Emergency Priority"
                                  className={`p-1.5 rounded-lg border text-xs transition ${
                                    isEmergency
                                      ? 'bg-rose-950 text-rose-400 border-rose-800'
                                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-rose-400'
                                  }`}
                                >
                                  <Flame size={14} />
                                </button>
                              )}

                              <button
                                onClick={() => setPrintedToken(tok)}
                                title="Print Official Token Slip"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition"
                              >
                                <Printer size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Fast Walk-In Form Tab */}
      {activeTab === 'walkin' && (
        <div className="max-w-2xl mx-auto glass-panel p-6 sm:p-8 border-slate-800">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Generate Fast Walk-In Token</h2>
              <p className="text-xs text-slate-400">Issue an instantaneous token slip for arriving clinic walk-in patients.</p>
            </div>
          </div>

          <form onSubmit={handleWalkInSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Patient Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={walkInData.patientName}
                  onChange={(e) => setWalkInData(prev => ({ ...prev, patientName: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Mobile Number (for live WhatsApp tracking) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 00000"
                  value={walkInData.patientPhone}
                  onChange={(e) => setWalkInData(prev => ({ ...prev, patientPhone: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Age & Gender</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Age"
                    value={walkInData.patientAge}
                    onChange={(e) => setWalkInData(prev => ({ ...prev, patientAge: e.target.value }))}
                    className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <select
                    value={walkInData.patientGender}
                    onChange={(e) => setWalkInData(prev => ({ ...prev, patientGender: e.target.value }))}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Select Doctor OPD <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={walkInData.doctorId}
                  onChange={(e) => setWalkInData(prev => ({ ...prev, doctorId: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialization} - {d.roomNumber.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Chief Complaint / Symptoms</label>
              <input
                type="text"
                placeholder="e.g. Fever, chest discomfort, dressing change, follow-up"
                value={walkInData.reason}
                onChange={(e) => setWalkInData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Priority Checkboxes */}
            <div className="flex flex-wrap gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={walkInData.isEmergency}
                  onChange={(e) => setWalkInData(prev => ({ ...prev, isEmergency: e.target.checked }))}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
                />
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <Flame size={13} /> Emergency Triage (Bumps to Front of Queue)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={walkInData.isSenior}
                  onChange={(e) => setWalkInData(prev => ({ ...prev, isSenior: e.target.checked }))}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
                />
                <span className="text-amber-400 font-semibold">
                  Senior Citizen (Priority Level 2)
                </span>
              </label>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Issue & Print Live Token Slip
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Today's Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="glass-panel overflow-hidden border-slate-800">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <CalendarCheck size={16} className="text-cyan-400" /> Pre-Booked Appointments for Today
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Total Bookings: {appointments.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Booking Ref</th>
                  <th className="px-5 py-3.5">Patient Details</th>
                  <th className="px-5 py-3.5">Doctor</th>
                  <th className="px-5 py-3.5">Slot Time</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">OPD Check-In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500 italic">
                      No appointments booked for today.
                    </td>
                  </tr>
                ) : (
                  appointments.map((apt) => {
                    const isCheckedIn = apt.status === 'checked_in';
                    const isCompleted = apt.status === 'completed';

                    return (
                      <tr key={apt.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-bold text-cyan-400">
                            {apt.appointmentNumber}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-bold text-white">{apt.patientName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{apt.patientPhone}</div>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-200">{apt.doctorName}</div>
                          <div className="text-[11px] text-slate-400">{apt.roomNumber}</div>
                        </td>

                        <td className="px-5 py-3.5 font-mono font-bold text-slate-300">
                          {apt.slotTime}
                        </td>

                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            isCheckedIn
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isCompleted
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}>
                            {apt.status}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          {isCheckedIn ? (
                            <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center justify-end gap-1">
                              <CheckCircle2 size={13} /> Token #{apt.displayToken || apt.tokenNumber}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleCheckInAppointment(apt.id)}
                              className="py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-md shadow-cyan-900/40"
                            >
                              Check-In Patient
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Thermal Receipt Modal */}
      {printedToken && (
        <PrintTokenModal
          token={printedToken}
          clinic={clinic}
          onClose={() => setPrintedToken(null)}
          onTrack={(tokNum) => onNavigateToTracker && onNavigateToTracker(tokNum)}
        />
      )}
    </div>
  );
};
