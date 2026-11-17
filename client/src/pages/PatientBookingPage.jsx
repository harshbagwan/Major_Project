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
  ChevronRight,
  MapPin,
  Clock4
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
    setOtpCode('1234');
    setOtpError('');
    setShowOtpModal(true);
  };

  const handleConfirmOtp = async () => {
    setIsVerifying(true);
    setOtpError('');

    try {
      await api.verifyOTP({ phone: formData.patientPhone, otp: otpCode });

      const result = await api.bookAppointment({
        ...formData,
        doctorId: selectedDoctor.id,
        appointmentDate: selectedDate,
        slotTime: selectedSlot
      });

      setShowOtpModal(false);
      setConfirmedBooking(result.appointment);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {
      setOtpError(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-3">
          <Sparkles size={14} className="text-teal-600" /> Fast & Simple OPD Booking
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Book an Appointment
        </h1>
        <p className="text-slate-600 text-sm mt-2">
          Select your specialist doctor, pick a convenient time, and monitor your queue position in real time on your phone.
        </p>
      </div>

      {confirmedBooking ? (
        /* Confirmed Booking Success Card */
        <div className="max-w-xl mx-auto bg-white p-8 text-center rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <CheckCircle2 size={36} />
          </div>

          <span className="text-xs uppercase tracking-widest font-bold text-emerald-700">
            Appointment Confirmed
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
            Booking #{confirmedBooking.appointmentNumber}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Confirmation message sent to <strong className="text-slate-800 font-mono">{confirmedBooking.patientPhone}</strong>.
          </p>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 my-6 text-left space-y-2.5 text-xs text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Patient Name:</span>
              <span className="font-bold text-slate-900">{confirmedBooking.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Consulting Doctor:</span>
              <span className="font-bold text-teal-800">{confirmedBooking.doctorName} ({confirmedBooking.specialization})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date & Slot:</span>
              <span className="font-bold text-slate-900">{confirmedBooking.appointmentDate} at {confirmedBooking.slotTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Consultation Room:</span>
              <span className="font-bold text-slate-900">{confirmedBooking.roomNumber}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-100 text-xs text-teal-900 text-left mb-6">
            💡 <strong>Quick Check-In:</strong> When you arrive at the clinic, simply provide this Booking ID to the receptionist to receive your live OPD token.
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setConfirmedBooking(null)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              Book Another Appointment
            </button>
            <button
              onClick={() => onNavigateToTracker && onNavigateToTracker()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
            >
              <Ticket size={16} /> Track Queue Position Live
            </button>
          </div>
        </div>
      ) : (
        /* 3-Step Booking Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Doctor Selection */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Stethoscope size={16} className="text-teal-600" /> 1. Choose Doctor
              </h2>
              <span className="text-xs text-slate-500">Available specialists</span>
            </div>

            <div className="space-y-3">
              {doctors.map((doc) => {
                const isSelected = selectedDoctor?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600/10 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        src={doc.avatarUrl}
                        alt={doc.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-slate-900 truncate">{doc.name}</h3>
                          <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                            ₹{doc.fee}
                          </span>
                        </div>
                        <p className="text-xs text-teal-700 font-medium">{doc.specialization}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{doc.bio}</p>

                        <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                          <span>📍 {doc.roomNumber}</span>
                          <span>•</span>
                          <span className={doc.waitingCount === 0 ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
                            {doc.waitingCount === 0 ? 'No Wait (Doctor Free)' : `~${doc.estimatedWaitTime}m wait (${doc.waitingCount} waiting)`}
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
            <form onSubmit={handleInitialSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              {/* Date & Slot Picker */}
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-3">
                  <Calendar size={16} className="text-teal-600" /> 2. Date & Time Slot
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Consultation Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">OPD Room</label>
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-medium">
                      {selectedDoctor?.roomNumber || 'Select doctor first'}
                    </div>
                  </div>
                </div>

                <label className="block text-xs font-semibold text-slate-700 mb-2">Select Preferred Slot</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-medium transition text-center border ${
                          isSelected
                            ? 'bg-teal-600 text-white font-bold border-teal-600 shadow-xs'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Patient Information Form */}
              <div className="border-t border-slate-100 pt-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-4">
                  <User size={16} className="text-teal-600" /> 3. Patient Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="patientName"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="patientPhone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.patientPhone}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 font-mono shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Age</label>
                    <input
                      type="number"
                      name="patientAge"
                      placeholder="e.g. 34"
                      value={formData.patientAge}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 font-mono shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
                    <select
                      name="patientGender"
                      value={formData.patientGender}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-2xs"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reason for Visit / Symptoms</label>
                  <input
                    type="text"
                    name="reason"
                    placeholder="e.g. Routine consultation, seasonal fever, blood pressure checkup"
                    value={formData.reason}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading || !selectedSlot}
                className="w-full py-3.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Confirm & Verify Appointment</span>
                <ChevronRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3 border border-teal-100">
              <ShieldCheck size={26} />
            </div>

            <h3 className="text-lg font-bold text-center text-slate-900">
              Confirm Phone Number
            </h3>
            <p className="text-xs text-center text-slate-500 mt-1">
              Enter the 4-digit code sent to <strong className="text-slate-800">{formData.patientPhone}</strong>
            </p>

            <div className="my-6">
              <div className="flex justify-center">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="1234"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-48 text-center text-2xl font-mono font-bold tracking-widest bg-slate-50 border border-teal-600/40 rounded-xl py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>
              <p className="text-center text-xs text-slate-400 mt-2">
                Demo Code: <code className="text-teal-700 font-mono font-bold">1234</code>
              </p>
              {otpError && (
                <p className="text-center text-xs text-rose-600 font-medium mt-2 flex items-center justify-center gap-1">
                  <AlertCircle size={13} /> {otpError}
                </p>
              )}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="flex-1 py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOtp}
                disabled={isVerifying || !otpCode}
                className="flex-1 py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                {isVerifying ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
