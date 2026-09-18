import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Ticket,
  ChevronRight
} from 'lucide-react';

export const PatientBookingPage = ({ onNavigateToTracker }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientAge: '',
    patientGender: 'Male',
    reason: ''
  });

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Confirmed Appointment Result
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const availableSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'
  ];

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const data = await api.getDoctors();
      setDoctors(data.doctors || []);
      if (data.doctors && data.doctors.length > 0) {
        setSelectedDoctor(data.doctors[0]);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.patientPhone || !selectedDoctor || !selectedSlot) {
      alert('Please fill out all required fields and select a consultation slot.');
      return;
    }
    // Open OTP verification dialog (Weeks 5-6 spec: phone + OTP verification)
    setOtpCode('1234'); // auto-suggest test OTP for solo build convenience
    setOtpError('');
    setShowOtpModal(true);
  };

  const handleConfirmOtp = async () => {
    setIsVerifying(true);
    setOtpError('');

    try {
      // 1. Verify OTP with backend
      await api.verifyOTP({ phone: formData.patientPhone, otp: otpCode });

      // 2. Create the Appointment
      const result = await api.bookAppointment({
        ...formData,
        doctorId: selectedDoctor.id,
        appointmentDate: selectedDate,
        slotTime: selectedSlot
      });

      setShowOtpModal(false);
      setConfirmedBooking(result.appointment);

      // Trigger Confetti Celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      setOtpError(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles size={14} /> Zero Waiting Queue System
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Book Doctor Appointment
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Reserve your preferred time slot, receive live SMS/WhatsApp queue updates, and track your doctor's queue right from your phone.
        </p>
      </div>

      {confirmedBooking ? (
        /* Confirmed Booking Success Card */
        <div className="max-w-xl mx-auto glass-panel p-8 text-center border-emerald-500/40 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 size={36} />
          </div>

          <span className="text-xs uppercase tracking-widest font-bold text-emerald-400">
            Booking Confirmed & Verified
          </span>
          <h2 className="text-2xl font-black text-white mt-1">
            Appointment #{confirmedBooking.appointmentNumber}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            A confirmation SMS & WhatsApp message has been dispatched to <span className="font-mono text-cyan-400">{confirmedBooking.patientPhone}</span>.
          </p>

          <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 my-6 text-left space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Patient:</span>
              <span className="font-bold text-white">{confirmedBooking.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Doctor:</span>
              <span className="font-bold text-cyan-300">{confirmedBooking.doctorName} ({confirmedBooking.specialization})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date & Slot:</span>
              <span className="font-bold text-white">{confirmedBooking.appointmentDate} at {confirmedBooking.slotTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Room Location:</span>
              <span className="font-bold text-white">{confirmedBooking.roomNumber}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 mb-6 text-xs text-slate-300">
            💡 <strong className="text-cyan-300">Fast OPD Check-in:</strong> When you arrive at the clinic, simply show this Booking ID at the reception desk to instantly receive your live queue token.
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setConfirmedBooking(null)}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
            >
              Book Another Appointment
            </button>
            <button
              onClick={() => onNavigateToTracker && onNavigateToTracker()}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2"
            >
              <Ticket size={16} /> Track Live Clinic Queue
            </button>
          </div>
        </div>
      ) : (
        /* 3-Step Booking Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Doctor Selection */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Stethoscope size={16} className="text-cyan-400" /> 1. Select Specialist Doctor
            </h2>

            <div className="space-y-3">
              {doctors.map((doc) => {
                const isSelected = selectedDoctor?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc)}
                    className={`glass-card p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500/50'
                        : 'hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        src={doc.avatarUrl}
                        alt={doc.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-white truncate">{doc.name}</h3>
                          <span className="text-xs font-mono font-bold text-cyan-400">₹{doc.fee}</span>
                        </div>
                        <p className="text-xs text-cyan-300 font-medium">{doc.specialization}</p>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{doc.bio}</p>

                        <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-white/5 text-[10px] text-slate-400">
                          <span>📍 {doc.roomNumber}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-medium">
                            {doc.waitingCount === 0 ? 'No Wait (Free)' : `~${doc.estimatedWaitTime} min wait (${doc.waitingCount} in line)`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Date, Slot & Patient Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleInitialSubmit} className="glass-panel p-6 sm:p-8 space-y-6">
              {/* Date & Slot Picker */}
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
                  <Calendar size={16} className="text-cyan-400" /> 2. Choose Date & Time Slot
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Consultation Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Assigned Room</label>
                    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-400">
                      {selectedDoctor?.roomNumber || 'Select doctor first'}
                    </div>
                  </div>
                </div>

                <label className="block text-xs font-semibold text-slate-300 mb-2">Available Slots</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-mono font-semibold transition text-center ${
                          isSelected
                            ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-900/40'
                            : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Patient Information Form */}
              <div className="border-t border-slate-800 pt-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-4">
                  <User size={16} className="text-cyan-400" /> 3. Patient Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="patientName"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Mobile Number (for SMS & WhatsApp) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="patientPhone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.patientPhone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Age</label>
                    <input
                      type="number"
                      name="patientAge"
                      placeholder="e.g. 34"
                      value={formData.patientAge}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Gender</label>
                    <select
                      name="patientGender"
                      value={formData.patientGender}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Symptoms or Visit Reason</label>
                  <input
                    type="text"
                    name="reason"
                    placeholder="e.g. Mild chest pain, routine review, blood pressure checkup"
                    value={formData.reason}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading || !selectedSlot}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-sm font-bold transition shadow-lg shadow-cyan-950/60 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Proceed to Phone Verification</span>
                <ChevronRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OTP Verification Modal (Weeks 5-6 Spec) */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={28} />
            </div>

            <h3 className="text-lg font-bold text-center text-white">
              Verify Your Phone Number
            </h3>
            <p className="text-xs text-center text-slate-400 mt-1">
              We have sent a 4-digit OTP code via SMS/WhatsApp to{' '}
              <span className="font-mono text-cyan-400 font-bold">{formData.patientPhone}</span>
            </p>

            <div className="my-6">
              <div className="flex justify-center">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="1234"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-48 text-center text-2xl font-mono font-bold tracking-widest bg-slate-950 border border-cyan-500/60 rounded-xl py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <p className="text-center text-[11px] text-slate-500 mt-2">
                Demo Quick Code: <code className="text-cyan-400 font-mono font-bold">1234</code>
              </p>
              {otpError && (
                <p className="text-center text-xs text-rose-400 font-medium mt-2 flex items-center justify-center gap-1">
                  <AlertCircle size={13} /> {otpError}
                </p>
              )}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOtp}
                disabled={isVerifying || !otpCode}
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md shadow-cyan-900/40 disabled:opacity-50"
              >
                {isVerifying ? 'Verifying...' : 'Confirm & Book'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
