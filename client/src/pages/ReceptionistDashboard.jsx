import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { PrintTokenModal } from '../components/PrintTokenModal';
import { RescheduleModal } from '../components/RescheduleModal';
import { PatientHistoryModal } from '../components/PatientHistoryModal';
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
  ShieldAlert,
  Calendar,
  XCircle,
  History
} from 'lucide-react';

export const ReceptionistDashboard = ({ clinic, onNavigateToTracker }) => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [queueTokens, setQueueTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'walkin', 'appointments'

  // Modals
  const [printedToken, setPrintedToken] = useState(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAptToReschedule, setSelectedAptToReschedule] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyPhone, setHistoryPhone] = useState('');
  const [historyPatientName, setHistoryPatientName] = useState('');

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

  const handleCancelAppointment = async (aptId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.cancelAppointment(aptId);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to cancel appointment');
    }
  };

  const handleOpenReschedule = (apt) => {
    setSelectedAptToReschedule(apt);
    setRescheduleModalOpen(true);
  };

  const handleOpenPatientHistory = (phone, name) => {
    setHistoryPhone(phone || '');
    setHistoryPatientName(name || '');
    setHistoryModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Front Desk & Reception OPD
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Staff Portal
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Issue walk-in tokens in seconds, check in online appointments, and manage patient priority queue.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'queue' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock size={15} />
            <span>Live Queue ({queueTokens.filter(t => t.status === 'waiting' || t.status === 'serving').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('walkin')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'walkin' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserPlus size={15} />
            <span>Walk-In Token</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'appointments' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarCheck size={15} />
            <span>Today's Bookings ({appointments.length})</span>
          </button>

          <button
            onClick={() => handleOpenPatientHistory('', '')}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <History size={15} className="text-teal-600" />
            <span>Medical History</span>
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
                <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.avatarUrl}
                      alt={doc.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{doc.name}</h4>
                      <p className="text-[11px] text-teal-700 font-medium">{doc.roomNumber.split(' ')[0]}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Serving</span>
                    <span className="font-mono font-bold text-sm text-emerald-700">
                      {docServing ? docServing.displayToken : '—'}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      ({docWaiting} waiting)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Queue Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Clock size={16} className="text-teal-600" />
                <span>Active Clinic Queue</span>
              </h3>
              <button
                onClick={loadData}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Token #</th>
                    <th className="px-5 py-3.5">Patient Details</th>
                    <th className="px-5 py-3.5">Assigned Doctor</th>
                    <th className="px-5 py-3.5">Type & Priority</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queueTokens.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-400 italic">
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
                          className={`hover:bg-slate-50 transition-colors ${
                            tok.status === 'serving'
                              ? 'bg-emerald-50/50'
                              : isEmergency
                              ? 'bg-rose-50/50'
                              : ''
                          }`}
                        >
                          <td className="px-5 py-3.5">
                            <span className="font-mono font-bold text-sm text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                              {tok.displayToken}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="font-bold text-slate-900">{tok.patientName}</div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                              <span>{tok.patientPhone}</span>
                              {tok.patientAge && <span>• {tok.patientAge}y</span>}
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-slate-800">{doc?.name || 'Doctor'}</div>
                            <div className="text-[11px] text-slate-500">{tok.roomNumber}</div>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              {isEmergency ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                                  <Flame size={11} /> Urgent
                                </span>
                              ) : isSenior ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                  Senior Citizen
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                  {tok.tokenType === 'appointment' ? 'Appointment' : 'Walk-in'}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                              tok.status === 'serving'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : tok.status === 'completed'
                                ? 'bg-slate-100 text-slate-600'
                                : tok.status === 'no_show'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-teal-50 text-teal-800 border border-teal-200'
                            }`}>
                              {tok.status === 'serving' ? 'Serving Inside' : tok.status}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {tok.status === 'waiting' && (
                                <button
                                  onClick={() => handlePriorityToggle(tok.id, !isEmergency, false)}
                                  title="Toggle Urgent Priority"
                                  className={`p-1.5 rounded-lg border text-xs transition ${
                                    isEmergency
                                      ? 'bg-rose-100 text-rose-700 border-rose-300'
                                      : 'bg-white text-slate-500 border-slate-300 hover:text-rose-600 hover:border-rose-300'
                                  }`}
                                >
                                  <Flame size={14} />
                                </button>
                              )}

                              <button
                                onClick={() => setPrintedToken(tok)}
                                title="Print Token Slip"
                                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition"
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
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Issue Walk-In Token</h2>
              <p className="text-xs text-slate-500">Issue an instant token slip for arriving clinic walk-in patients.</p>
            </div>
          </div>

          <form onSubmit={handleWalkInSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Patient Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={walkInData.patientName}
                  onChange={(e) => setWalkInData(prev => ({ ...prev, patientName: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Mobile Number (for SMS / WhatsApp updates) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 00000"
                  value={walkInData.patientPhone}
                  onChange={(e) => setWalkInData(prev => ({ ...prev, patientPhone: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">Age & Gender</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Age"
                    value={walkInData.patientAge}
                    onChange={(e) => setWalkInData(prev => ({ ...prev, patientAge: e.target.value }))}
                    className="w-24 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                  <select
                    value={walkInData.patientGender}
                    onChange={(e) => setWalkInData(prev => ({ ...prev, patientGender: e.target.value }))}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Select Doctor OPD <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={walkInData.doctorId}
                  onChange={(e) => setWalkInData(prev => ({ ...prev, doctorId: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              <label className="block font-medium text-slate-700 mb-1.5">Chief Complaint / Symptoms</label>
              <input
                type="text"
                placeholder="e.g. Fever, cough, blood pressure checkup, routine consultation"
                value={walkInData.reason}
                onChange={(e) => setWalkInData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Priority Checkboxes */}
            <div className="flex flex-wrap gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={walkInData.isEmergency}
                  onChange={(e) => setWalkInData(prev => ({ ...prev, isEmergency: e.target.checked }))}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                />
                <span className="text-rose-700 font-semibold flex items-center gap-1">
                  <Flame size={13} /> Emergency Triage (Prioritize to front of line)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={walkInData.isSenior}
                  onChange={(e) => setWalkInData(prev => ({ ...prev, isSenior: e.target.checked }))}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                />
                <span className="text-amber-800 font-semibold">
                  Senior Citizen Priority
                </span>
              </label>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-2"
              >
                <Printer size={16} />
                <span>Issue & Print Live Token Slip</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Today's Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <CalendarCheck size={16} className="text-teal-600" />
              <span>Pre-Booked Appointments for Today</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Total Bookings: {appointments.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Booking Ref</th>
                  <th className="px-5 py-3.5">Patient Details</th>
                  <th className="px-5 py-3.5">Doctor</th>
                  <th className="px-5 py-3.5">Slot Time</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">OPD Check-In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400 italic">
                      No appointments booked for today.
                    </td>
                  </tr>
                ) : (
                  appointments.map((apt) => {
                    const isCheckedIn = apt.status === 'checked_in';
                    const isCompleted = apt.status === 'completed';

                    return (
                      <tr key={apt.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {apt.appointmentNumber}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900">{apt.patientName}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-slate-500 font-mono">{apt.patientPhone}</span>
                            <button
                              type="button"
                              onClick={() => handleOpenPatientHistory(apt.patientPhone, apt.patientName)}
                              title="View Patient Medical History"
                              className="text-teal-600 hover:text-teal-800 transition"
                            >
                              <History size={12} />
                            </button>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-800">{apt.doctorName}</div>
                          <div className="text-[11px] text-slate-500">{apt.roomNumber}</div>
                        </td>

                        <td className="px-5 py-3.5 font-mono font-bold text-slate-700">
                          {apt.slotTime}
                        </td>

                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                            isCheckedIn
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : isCompleted
                              ? 'bg-slate-100 text-slate-600'
                              : apt.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-teal-50 text-teal-800 border border-teal-200'
                          }`}>
                            {apt.status}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          {isCheckedIn ? (
                            <span className="text-[11px] text-emerald-700 font-mono font-bold flex items-center justify-end gap-1">
                              <CheckCircle2 size={13} /> Token #{apt.displayToken || apt.tokenNumber}
                            </span>
                          ) : isCompleted ? (
                            <span className="text-[11px] text-slate-400 font-mono">Completed</span>
                          ) : apt.status === 'cancelled' ? (
                            <span className="text-[11px] text-rose-500 font-mono">Cancelled</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleCheckInAppointment(apt.id)}
                                className="py-1 px-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition shadow-2xs"
                              >
                                Check-In
                              </button>
                              <button
                                onClick={() => handleOpenReschedule(apt)}
                                title="Reschedule Appointment"
                                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 transition border border-slate-300"
                              >
                                <Calendar size={13} />
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(apt.id)}
                                title="Cancel Appointment"
                                className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 transition border border-slate-300 hover:border-rose-300"
                              >
                                <XCircle size={13} />
                              </button>
                            </div>
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

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        appointment={selectedAptToReschedule}
        onRescheduled={() => loadData()}
      />

      {/* Patient Past EHR History Modal */}
      <PatientHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        phone={historyPhone}
        patientName={historyPatientName}
      />
    </div>
  );
};
