import React from 'react';
import { X, Users, Stethoscope, Shield, UserCheck, Activity, Clock } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const OnlineUsersModal = ({ isOpen, onClose }) => {
  const { onlineUsers, isConnected } = useSocket();

  if (!isOpen) return null;

  const doctorsOnline = onlineUsers.filter(u => u.role === 'doctor');
  const receptionistsOnline = onlineUsers.filter(u => u.role === 'receptionist');
  const adminsOnline = onlineUsers.filter(u => u.role === 'admin');
  const patientsOnline = onlineUsers.filter(u => u.role === 'patient');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Users size={18} />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Active Hospital Staff & Users</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {onlineUsers.length} Online
                </span>
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span>Real-Time WebSocket Presence Telemetry</span>
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {onlineUsers.length === 0 ? (
            <div className="py-8 text-center text-slate-500 italic">
              Connecting to real-time hospital telemetry...
            </div>
          ) : (
            <>
              {/* Doctors Online */}
              <div>
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2.5">
                  <Stethoscope size={14} className="text-teal-600" />
                  <span>Doctors on Duty ({doctorsOnline.length})</span>
                </span>
                {doctorsOnline.length === 0 ? (
                  <p className="text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    No doctor currently signed in.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {doctorsOnline.map(doc => (
                      <div key={doc.socketId || doc.id} className="p-3 bg-white border border-teal-200 rounded-xl flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{doc.avatar || '👨‍⚕️'}</span>
                          <div>
                            <h4 className="font-bold text-slate-900">{doc.name}</h4>
                            <p className="text-teal-700 text-[11px] font-medium">
                              {doc.roomNumber || 'Consultation Room'} • Active on OPD Desk
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Receptionists Online */}
              <div>
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2.5">
                  <UserCheck size={14} className="text-sky-600" />
                  <span>Front Desk Staff ({receptionistsOnline.length})</span>
                </span>
                {receptionistsOnline.length === 0 ? (
                  <p className="text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    Reception staff offline.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {receptionistsOnline.map(rec => (
                      <div key={rec.socketId || rec.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{rec.avatar || '👩‍💼'}</span>
                          <div>
                            <h4 className="font-bold text-slate-900">{rec.name}</h4>
                            <p className="text-slate-500 text-[11px]">Reception OPD Queue Dispatch</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Administrators Online */}
              <div>
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2.5">
                  <Shield size={14} className="text-amber-600" />
                  <span>Administrators ({adminsOnline.length})</span>
                </span>
                {adminsOnline.length === 0 ? (
                  <p className="text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    No administrator currently active.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {adminsOnline.map(admin => (
                      <div key={admin.socketId || admin.id} className="p-3 bg-white border border-amber-200 rounded-xl flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{admin.avatar || '🛡️'}</span>
                          <div>
                            <h4 className="font-bold text-slate-900">{admin.name}</h4>
                            <p className="text-amber-800 text-[11px]">Superuser • Full Operations Access</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Patients Online in Queue */}
              {patientsOnline.length > 0 && (
                <div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2.5">
                    <Users size={14} className="text-teal-600" />
                    <span>Patients Tracking Live Queue ({patientsOnline.length})</span>
                  </span>
                  <div className="space-y-2">
                    {patientsOnline.map(p => (
                      <div key={p.socketId || p.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{p.avatar || '🧑'}</span>
                          <span className="font-medium text-slate-800">{p.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Connected via Phone
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 flex items-center justify-between border-t border-slate-200 text-xs">
          <span className="text-slate-500 text-[11px]">
            Presence tracked via Socket.io session heartbeats
          </span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
