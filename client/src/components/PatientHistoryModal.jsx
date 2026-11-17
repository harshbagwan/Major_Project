import React, { useState, useEffect } from 'react';
import { X, User, Clock, Calendar, FileText, Stethoscope, HeartPulse, Search, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const PatientHistoryModal = ({ isOpen, onClose, phone, patientName, onViewPrescription }) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchPhone, setSearchPhone] = useState(phone || '');
  const [activeTab, setActiveTab] = useState('consultations'); // 'consultations', 'appointments'

  useEffect(() => {
    if (phone) {
      setSearchPhone(phone);
      loadHistory(phone);
    }
  }, [phone, isOpen]);

  const loadHistory = async (targetPhone) => {
    if (!targetPhone) return;
    try {
      setLoading(true);
      const data = await api.getPatientHistory(targetPhone);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load patient history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadHistory(searchPhone);
  };

  if (!isOpen) return null;

  const consultations = history?.consultations || [];
  const appointments = history?.appointments || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-teal-100 text-teal-800 rounded-xl">
              <User size={18} />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Patient Medical & Visit History</span>
                {patientName && <span className="text-teal-700 font-semibold">• {patientName}</span>}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Phone: {searchPhone || '—'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar & Tabs */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Search phone number..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              className="py-2 px-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition shadow-2xs"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl text-xs w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('consultations')}
              className={`py-1.5 px-3 rounded-lg font-semibold transition ${
                activeTab === 'consultations' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Past Prescriptions ({consultations.length})
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-1.5 px-3 rounded-lg font-semibold transition ${
                activeTab === 'appointments' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Appointments ({appointments.length})
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Loading patient clinical records...
            </div>
          ) : activeTab === 'consultations' ? (
            consultations.length > 0 ? (
              <div className="space-y-3">
                {consultations.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
                      <div className="flex items-center gap-2">
                        <Stethoscope size={15} className="text-teal-600" />
                        <span className="text-xs font-bold text-slate-900">{c.doctorName || 'Dr. Specialist'}</span>
                        <span className="text-[10px] text-teal-800 font-semibold px-2 py-0.5 rounded bg-teal-50 border border-teal-200">
                          {c.specialization || 'OPD'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(c.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Diagnosis</span>
                        <p className="text-slate-800 font-medium mt-0.5">{c.diagnosis}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Recorded Vitals</span>
                        <p className="text-slate-600 font-mono text-[11px] mt-0.5">
                          BP: {c.vitals?.bp || 'N/A'} • Pulse: {c.vitals?.pulse || 'N/A'} • Temp: {c.vitals?.temp || 'N/A'}°F
                        </p>
                      </div>
                    </div>

                    {c.prescription && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 text-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Prescribed Medicines</span>
                        <pre className="font-sans text-[11px] text-slate-700 whitespace-pre-wrap mt-0.5 line-clamp-2">
                          {c.prescription}
                        </pre>
                      </div>
                    )}

                    {onViewPrescription && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => onViewPrescription(c)}
                          className="py-1 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-semibold transition flex items-center gap-1 border border-teal-200"
                        >
                          <FileText size={13} /> View Full Rx Slip
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center">
                <AlertCircle size={28} className="text-slate-400 mb-2" />
                No past consultation records found for this phone number.
              </div>
            )
          ) : (
            appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-teal-600" />
                        <strong className="text-slate-900">{a.appointmentDate} at {a.slotTime}</strong>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          a.status === 'completed' ? 'bg-slate-100 text-slate-600' :
                          a.status === 'checked_in' ? 'bg-emerald-100 text-emerald-800' :
                          a.status === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-teal-50 text-teal-800 border border-teal-200'
                        }`}>
                          {a.status}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        Doctor: <span className="text-slate-800 font-semibold">{a.doctorName}</span> ({a.specialization}) • {a.roomNumber}
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Reason: {a.reason || 'General Checkup'}</p>
                    </div>

                    <div className="font-mono text-slate-500 text-right">
                      <span className="block text-[10px] uppercase text-slate-400">Booking Ref</span>
                      <strong className="text-teal-800">{a.appointmentNumber}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center">
                <AlertCircle size={28} className="text-slate-400 mb-2" />
                No past appointments found for this phone number.
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 flex justify-end border-t border-slate-200">
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
