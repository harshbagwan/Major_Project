import React from 'react';
import { X, Printer, Smartphone, Clock, MapPin, User, Stethoscope } from 'lucide-react';

export const PrintTokenModal = ({ token, clinic, onClose, onTrack }) => {
  if (!token) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Printer size={14} /> Official OPD Token Slip
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Printable Thermal Paper Content */}
        <div id="printable-token" className="p-6 bg-white text-slate-900 font-sans text-center">
          {/* Clinic Header */}
          <div className="border-b-2 border-dashed border-slate-300 pb-3 mb-4">
            <h3 className="font-extrabold text-base tracking-tight uppercase text-slate-900">
              {clinic?.name || 'Apollo Care Health Clinic'}
            </h3>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {clinic?.address || '42 Health City Avenue, Medical District'}
            </p>
            <p className="text-[11px] text-slate-600 font-mono">
              Tel: {clinic?.phone || '+91 98765 43210'}
            </p>
          </div>

          {/* Token Display Number */}
          <div className="py-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              {token.priorityLevel === 3 ? 'EMERGENCY PRIORITY TOKEN' : token.tokenType === 'appointment' ? 'APPOINTMENT TOKEN' : 'WALK-IN OPD TOKEN'}
            </p>
            <div className="my-2 py-2 px-4 inline-block border-2 border-slate-900 rounded-lg">
              <span className="text-4xl font-black font-mono tracking-tight text-slate-900">
                {token.displayToken}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 flex items-center justify-center gap-1">
              <Clock size={12} /> Issued at: {new Date(token.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Details Table */}
          <div className="text-left text-xs border-t border-b border-dashed border-slate-300 py-3 my-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Patient:</span>
              <span className="font-bold text-slate-900">{token.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Age / Gender:</span>
              <span className="font-medium text-slate-800">{token.patientAge || 'N/A'} Yrs / {token.patientGender || 'Other'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Doctor Room:</span>
              <span className="font-bold text-slate-900">{token.roomNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Reason:</span>
              <span className="text-slate-700 italic truncate max-w-[160px]">{token.reason || 'Consultation'}</span>
            </div>
          </div>

          {/* QR Code Simulation */}
          <div className="flex flex-col items-center justify-center pt-1 pb-2">
            <div className="p-2 border border-slate-300 rounded bg-slate-50">
              {/* Simulated SVG QR Code */}
              <svg width="72" height="72" viewBox="0 0 24 24" fill="currentColor" className="text-slate-800">
                <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm-2 10h8v8H2v-8zm2 2v4h4v-4H4zm10-14h8v8h-8V2zm2 2v4h4V4h-4zm2 10h-2v2h2v-2zm-2 4h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm-2 2h2v2h-2v-2zm-4-2h2v2h-2v-2zm4-6h2v2h-2v-2z" />
              </svg>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">Scan to track queue live</p>
          </div>

          <p className="text-[10px] text-slate-400 mt-2 italic">
            Please watch the waiting room TV screens for your token chime.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2.5">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition border border-slate-700"
          >
            <Printer size={15} /> Print Slip
          </button>
          <button
            onClick={() => {
              onClose();
              if (onTrack) onTrack(token.tokenNumber);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-900/40"
          >
            <Smartphone size={15} /> Track on Phone
          </button>
        </div>
      </div>
    </div>
  );
};
