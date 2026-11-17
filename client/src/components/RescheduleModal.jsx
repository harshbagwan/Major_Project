import React, { useState } from 'react';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const RescheduleModal = ({ isOpen, onClose, appointment, onRescheduled }) => {
  if (!isOpen || !appointment) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [newDate, setNewDate] = useState(appointment.appointmentDate || todayStr);
  const [newSlot, setNewSlot] = useState(appointment.slotTime || '10:00 AM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const slots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
    '06:00 PM', '06:30 PM', '07:00 PM'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const res = await api.rescheduleAppointment(appointment.id, {
        appointmentDate: newDate,
        slotTime: newSlot
      });
      if (onRescheduled) onRescheduled(res.appointment);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reschedule appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-100 text-teal-800 rounded-lg">
              <Calendar size={18} />
            </span>
            <h3 className="text-sm font-bold text-slate-900">Reschedule Appointment</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <p className="text-slate-600">
              Patient: <strong className="text-slate-900">{appointment.patientName}</strong> ({appointment.patientPhone})
            </p>
            <p className="text-slate-600">
              Doctor: <strong className="text-teal-800">{appointment.doctorName}</strong>
            </p>
            <p className="text-slate-500 text-[11px] font-mono">
              Current: {appointment.appointmentDate} at {appointment.slotTime} ({appointment.appointmentNumber})
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Select New Date
            </label>
            <input
              type="date"
              min={todayStr}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Select New Time Slot
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200">
              {slots.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setNewSlot(s)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium transition ${
                    newSlot === s
                      ? 'bg-teal-600 text-white font-semibold shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition shadow-xs"
            >
              {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
