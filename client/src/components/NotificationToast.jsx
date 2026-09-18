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
            className="pointer-events-auto p-4 rounded-xl shadow-2xl backdrop-blur-md border transition-all duration-300 animate-slide-up"
            style={{
              backgroundColor: isWhatsApp ? 'rgba(15, 35, 25, 0.92)' : 'rgba(15, 23, 42, 0.95)',
              borderColor: isWhatsApp ? 'rgba(16, 185, 129, 0.4)' : 'rgba(14, 165, 233, 0.4)'
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{
                    backgroundColor: isWhatsApp ? '#10b981' : '#0ea5e9',
                    color: '#ffffff'
                  }}
                >
                  {isWhatsApp ? <MessageSquare size={16} /> : <PhoneCall size={16} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      {isWhatsApp ? 'WhatsApp Cloud API' : 'Twilio SMS Alert'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      <CheckCheck size={11} /> Delivered
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    To: {notif.recipientPhone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismissNotification(notif.id)}
                className="text-slate-400 hover:text-white transition-colors p-1"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mt-2.5 text-xs text-slate-200 bg-black/30 p-2.5 rounded-lg font-sans leading-relaxed border border-white/5">
              {notif.content}
            </div>
          </div>
        );
      })}
    </div>
  );
};
