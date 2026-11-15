import React from 'react';
import { X, Printer, Stethoscope, HeartPulse, Activity, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';

export const MedicalPrescriptionModal = ({ isOpen, onClose, consultation, doctor, clinic, token }) => {
  if (!isOpen || !consultation) return null;

  const vitals = consultation.vitals || {};
  const printPrescription = () => {
    window.print();
  };

  // Parse medication lines from prescription string
  const rawPrescription = consultation.prescription || '';
  const medLines = rawPrescription
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Controls Header (Hidden in Print) */}
        <div className="no-print bg-slate-800/90 px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <FileText size={18} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Digital Medical Prescription</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Consultation Ref: {consultation.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={printPrescription}
              className="py-1.5 px-3.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-cyan-950"
            >
              <Printer size={15} /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Prescription Body */}
        <div id="printable-prescription" className="p-8 bg-white text-slate-900 font-sans">
          {/* Clinic & Doctor Header */}
          <div className="border-b-2 border-slate-800 pb-5 mb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center font-black text-lg">
                  +
                </div>
                <div>
                  <h1 className="text-xl font-extrabold uppercase tracking-tight text-cyan-900">
                    {clinic?.name || 'MediQ Health Clinic & OPD Centre'}
                  </h1>
                  <p className="text-xs text-slate-600">
                    {clinic?.address || '42, Health City Avenue, Medical District'}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-mono">
                Phone: {clinic?.phone || '+91 98765 43210'} • Email: {clinic?.email || 'helpdesk@mediq.health'}
              </p>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                {doctor?.name || 'Consulting Physician'}
              </h2>
              <p className="text-xs font-semibold text-cyan-800">
                {doctor?.title || doctor?.specialization || 'Consultant Specialist'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Reg: MED-IQ-2026-OPD • {doctor?.roomNumber || 'OPD Room 101'}
              </p>
            </div>
          </div>

          {/* Patient Meta Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Patient Name</span>
              <strong className="text-slate-900 text-sm">{consultation.patientName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Demographics</span>
              <span className="text-slate-800 font-medium">
                {consultation.patientAge ? `${consultation.patientAge} Yrs` : 'Adult'} / {consultation.patientGender || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Phone / Token</span>
              <span className="text-slate-800 font-mono font-medium">
                {consultation.patientPhone || token?.patientPhone || 'N/A'} {token?.displayToken && `(${token.displayToken})`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Date & Time</span>
              <span className="text-slate-800 font-medium">
                {new Date(consultation.created_at || Date.now()).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Recorded Vitals Banner */}
          <div className="border border-slate-200 rounded-lg p-3 mb-6 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <HeartPulse size={14} className="text-rose-500" /> Patient Vitals:
            </span>
            <div className="flex items-center gap-6">
              <div>
                <span className="text-slate-500">BP: </span>
                <strong className="text-slate-900">{vitals.bp || '120/80'} mmHg</strong>
              </div>
              <div>
                <span className="text-slate-500">Pulse: </span>
                <strong className="text-slate-900">{vitals.pulse || '72'} bpm</strong>
              </div>
              <div>
                <span className="text-slate-500">Temp: </span>
                <strong className="text-slate-900">{vitals.temp || '98.6'} °F</strong>
              </div>
            </div>
          </div>

          {/* Clinical Diagnosis */}
          <div className="mb-6">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-500 block mb-1">
              Clinical Diagnosis / Assessment
            </span>
            <div className="p-3 bg-cyan-50/50 border border-cyan-100 rounded-lg text-slate-900 font-medium text-sm">
              {consultation.diagnosis || 'Routine Health Examination'}
            </div>
          </div>

          {/* Rx Prescribed Medications */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-200">
              <span className="text-xl font-serif font-black text-cyan-800">℞</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Prescribed Medications
              </span>
            </div>

            {medLines.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="py-2 px-3 w-10 text-center">#</th>
                      <th className="py-2 px-3">Medicine Name & Strength</th>
                      <th className="py-2 px-3 text-right">Schedule / Advice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {medLines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{line}</td>
                        <td className="py-2 px-3 text-right text-slate-600 font-mono text-[11px]">
                          As directed by physician
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs italic text-slate-500 bg-slate-50 p-3 rounded border border-slate-200">
                No systemic medications prescribed. Follow lifestyle and dietary guidelines.
              </p>
            )}
          </div>

          {/* Clinical Notes & Advice */}
          {consultation.notes && (
            <div className="mb-6">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-500 block mb-1">
                Special Advice & Instructions
              </span>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                {consultation.notes}
              </p>
            </div>
          )}

          {/* Follow-up and Digital Sign-off */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6 mt-8">
            <div>
              {consultation.followUpDate ? (
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                  <Calendar size={14} className="text-amber-600" />
                  Follow-up Review: <strong>{consultation.followUpDate}</strong>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500">
                  Follow up as needed if symptoms persist.
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-2 font-mono">
                Valid for pharmacy dispensing & clinical reference
              </p>
            </div>

            {/* Doctor Signature Block */}
            <div className="text-center sm:text-right">
              <div className="font-serif italic text-base text-cyan-900 mb-1 border-b border-dashed border-slate-400 pb-1 px-4">
                {doctor?.name || 'Dr. Consultant'}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Digitally Signed by Physician
              </span>
              <span className="text-[9px] text-slate-400 font-mono block">
                MediQ OPD Clinical System
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls (Hidden in Print) */}
        <div className="no-print bg-slate-800/60 px-6 py-3 flex justify-end border-t border-slate-700">
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
