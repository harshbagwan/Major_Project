import React from 'react';
import { useSocket } from '../context/SocketContext';
import { MessageSquare, PhoneCall, X, CheckCheck } from 'lucide-react';

export const NotificationToast = () => {
  const { recentNotifications, dismissNotification } = useSocket();

  if (!recentNotifications || recentNotifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {recentNotifications.map((notif) => {
        const isWhatsApp = notif.channel === 'WHATSAPP';

        return (
          <div
            key={notif.id}
            className="pointer-events-auto p-4 rounded-xl shadow-xl bg-white border border-slate-200 transition-all duration-300 animate-slide-up"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    isWhatsApp ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
                  }`}
                >
                  {isWhatsApp ? <MessageSquare size={16} /> : <PhoneCall size={16} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                      {isWhatsApp ? 'WhatsApp Alert' : 'SMS Notification'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      <CheckCheck size={11} /> Sent
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    To: {notif.recipientPhone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismissNotification(notif.id)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mt-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg font-sans leading-relaxed border border-slate-200">
              {notif.content}
            </div>
          </div>
        );
      })}
    </div>
  );
};
