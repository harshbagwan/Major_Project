import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { MedicalPrescriptionModal } from '../components/MedicalPrescriptionModal';
import { PatientHistoryModal } from '../components/PatientHistoryModal';
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
  Check,
  History,
  Printer
} from 'lucide-react';

export const DoctorDeskPage = () => {
  const { user } = useAuth();
  const { queueTick } = useSocket();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('doc-1');
  const [queueTokens, setQueueTokens] = useState([]);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [selectedPrescriptionToken, setSelectedPrescriptionToken] = useState(null);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyPhone, setHistoryPhone] = useState('');
  const [historyPatientName, setHistoryPatientName] = useState('');

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

  useEffect(() => {
    loadDoctors();
    loadClinic();
  }, []);

  const loadClinic = async () => {
    try {
      const data = await api.getClinic();
      setClinic(data.clinic);
    } catch (err) {
      console.error('Failed to load clinic:', err);
    }
  };

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
      const res = await api.completeToken({
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

      // Automatically open official prescription modal for review / printing
      if (res.consultation) {
        setSelectedPrescription(res.consultation);
        setSelectedPrescriptionToken(res.token);
        setPrescriptionModalOpen(true);
      }
    } catch (err) {
      alert(err.message || 'Failed to complete consultation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewPrescriptionForToken = async (tok) => {
    try {
      const res = await api.getPrescriptionByToken(tok.id);
      setSelectedPrescription(res.consultation);
      setSelectedPrescriptionToken(res.token);
      setPrescriptionModalOpen(true);
    } catch (err) {
      alert(err.message || 'Prescription not found');
    }
  };

  const handleOpenPatientHistory = (phone, name) => {
    setHistoryPhone(phone || '');
    setHistoryPatientName(name || '');
    setHistoryModalOpen(true);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Doctor OPD Consultation Desk
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Clinical Workspace
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Call patients into your room, ring the waiting room display chime, and create digital medical prescriptions.
          </p>
        </div>

        {/* Doctor OPD Switcher */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 px-2">Doctor:</span>
          {doctors.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDoctorId(d.id)}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedDoctorId === d.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{d.name.split(' ')[1]}</span>
              <span className="text-[11px] opacity-80">({d.roomNumber.split(' ')[0]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Currently Serving Patient & Consultation Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Serving Hero Card */}
          <div className={`bg-white rounded-2xl border p-6 sm:p-7 shadow-sm transition-all ${
            servingToken
              ? 'border-teal-300 ring-2 ring-teal-50'
              : 'border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Stethoscope size={16} className="text-teal-600" />
                <span>Currently In Consultation</span>
              </span>
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                {currentDoctor?.roomNumber}
              </span>
            </div>

            {servingToken ? (
              <div className="my-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                      Token Number
                    </span>
                    <div className="text-4xl font-black font-mono text-teal-800 mt-1">
                      {servingToken.displayToken}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mt-1">
                      {servingToken.patientName}
                    </h2>
                    <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2">
                      <span>Phone: <strong>{servingToken.patientPhone}</strong></span>
                      <span>•</span>
                      <span>{servingToken.patientAge || '—'} yrs</span>
                      <span>•</span>
                      <span>{servingToken.patientGender}</span>
                      <button
                        type="button"
                        onClick={() => handleOpenPatientHistory(servingToken.patientPhone, servingToken.patientName)}
                        className="py-0.5 px-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded text-[11px] font-semibold flex items-center gap-1 transition ml-1"
                      >
                        <History size={12} /> Medical History
                      </button>
                    </div>
                  </div>

                  {/* Consultation Time / Wait Time */}
                  <div className="text-left sm:text-right bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 block">Patient Wait Time:</span>
                    <span className="font-mono font-bold text-amber-700 text-base">
                      {servingToken.waitTimeMinutes || 12} mins
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      Reason: <strong className="text-slate-700">{servingToken.reason || 'General Checkup'}</strong>
                    </span>
                  </div>
                </div>

                {/* Consultation Actions Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-6">
                  <button
                    onClick={handleRecall}
                    title="Ring chime and announce again on Waiting Room TV"
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200 flex items-center justify-center gap-1.5"
                  >
                    <Volume2 size={15} className="text-teal-600" />
                    <span>Re-Ring Chime</span>
                  </button>

                  <button
                    onClick={handleMarkNoShow}
                    title="Mark patient as absent"
                    className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition border border-rose-200 flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={15} />
                    <span>Mark Absent</span>
                  </button>

                  <button
                    onClick={handleCompleteConsultation}
                    disabled={actionLoading}
                    className="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={15} />
                    <span>Complete & Next</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <User size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Patient Currently Inside</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click the button below to call the next patient. The waiting room TV will chime and announce their token.
                </p>

                <button
                  onClick={() => handleCallNext()}
                  disabled={waitingTokens.length === 0 || actionLoading}
                  className="mt-5 py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition shadow-xs disabled:opacity-40 inline-flex items-center gap-2"
                >
                  <Volume2 size={15} />
                  <span>Call Next Patient ({waitingTokens.length} Waiting)</span>
                </button>
              </div>
            )}
          </div>

          {/* Clinical Prescription & Diagnosis Form */}
          {servingToken && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
                <FileText size={16} className="text-teal-600" />
                <span>Patient Medical Notes & Prescription</span>
              </h3>

              {/* Patient Vitals */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={clinicalNotes.bp}
                    onChange={(e) => setClinicalNotes(prev => ({ ...prev, bp: e.target.value }))}
                    placeholder="120/80"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Pulse (bpm)</label>
                  <input
                    type="text"
                    value={clinicalNotes.pulse}
                    onChange={(e) => setClinicalNotes(prev => ({ ...prev, pulse: e.target.value }))}
                    placeholder="74"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Temp (°F)</label>
                  <input
                    type="text"
                    value={clinicalNotes.temp}
                    onChange={(e) => setClinicalNotes(prev => ({ ...prev, temp: e.target.value }))}
                    placeholder="98.6"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Clinical Diagnosis</label>
                <input
                  type="text"
                  value={clinicalNotes.diagnosis}
                  onChange={(e) => setClinicalNotes(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="e.g. Mild Angina, Viral Upper Respiratory Tract Infection, Diabetes Type 2"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Prescription / Medicines */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Prescribed Medicines & Dosage</label>
                <textarea
                  rows={3}
                  value={clinicalNotes.prescription}
                  onChange={(e) => setClinicalNotes(prev => ({ ...prev, prescription: e.target.value }))}
                  placeholder="1. Tab Paracetamol 650mg - 1 stat, then SOS&#10;2. Tab Amoxicillin 500mg - 1-0-1 x 5 days"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              {/* Notes & Follow-up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Special Advice / Lab Tests</label>
                  <input
                    type="text"
                    value={clinicalNotes.notes}
                    onChange={(e) => setClinicalNotes(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="e.g. Fasting Lipid Profile, Complete Blood Count"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Follow-up Review Date</label>
                  <input
                    type="date"
                    value={clinicalNotes.followUpDate}
                    onChange={(e) => setClinicalNotes(prev => ({ ...prev, followUpDate: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCompleteConsultation}
                  className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  <span>Save Prescription & Complete Consultation</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Doctor's Queue List & History (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <Clock size={16} className="text-teal-600" />
              <span>Waiting in Line ({waitingTokens.length})</span>
            </h3>
            <button
              onClick={() => loadQueue(selectedDoctorId)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {waitingTokens.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-500 text-xs italic shadow-2xs">
                All caught up! No waiting patients in this doctor's OPD.
              </div>
            ) : (
              waitingTokens.map((tok) => {
                const isEmergency = tok.priorityLevel === 3;
                const isSenior = tok.priorityLevel === 2;

                return (
                  <div
                    key={tok.id}
                    className={`bg-white rounded-xl p-3.5 flex items-center justify-between gap-3 border shadow-2xs transition ${
                      isEmergency
                        ? 'border-rose-300 bg-rose-50/40'
                        : isSenior
                        ? 'border-amber-300 bg-amber-50/40'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-mono font-bold text-sm text-teal-800 bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-200">
                        {tok.displayToken}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-slate-900">{tok.patientName}</h4>
                          {isEmergency && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-0.5">
                              <Flame size={10} /> Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-[170px]">
                          {tok.reason || 'General Consultation'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCallNext(tok.id)}
                        title="Call this specific patient into room"
                        className="py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition shadow-2xs"
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
          <div className="bg-white rounded-2xl border border-slate-200 p-5 mt-6 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center justify-between">
              <span>Completed Today</span>
              <span className="font-mono text-emerald-700 font-bold">{completedTokens.length} Patients</span>
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {completedTokens.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No consultations finished today yet.</p>
              ) : (
                completedTokens.map(tok => (
                  <div key={tok.id} className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-slate-700 mr-2">{tok.displayToken}</span>
                      <span className="text-slate-800 font-medium">{tok.patientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewPrescriptionForToken(tok)}
                        className="py-1 px-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded border border-teal-200 text-[11px] font-semibold flex items-center gap-1 transition"
                      >
                        <FileText size={11} /> Rx Slip
                      </button>
                      <span className="text-[11px] font-medium text-emerald-700">
                        ✓ Done
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Digital Medical Prescription Modal */}
      <MedicalPrescriptionModal
        isOpen={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        consultation={selectedPrescription}
        doctor={currentDoctor}
        clinic={clinic}
        token={selectedPrescriptionToken}
      />

      {/* Patient Past EHR History Modal */}
      <PatientHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        phone={historyPhone}
        patientName={historyPatientName}
        onViewPrescription={(c) => {
          setSelectedPrescription(c);
          setSelectedPrescriptionToken({ patientPhone: c.patientPhone, displayToken: c.tokenId });
          setPrescriptionModalOpen(true);
        }}
      />
    </div>
  );
};
