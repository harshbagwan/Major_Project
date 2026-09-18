import React, { useState, useEffect } from 'react';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { NotificationToast } from './components/NotificationToast';
import { PatientBookingPage } from './pages/PatientBookingPage';
import { PatientQueueTracker } from './pages/PatientQueueTracker';
import { WaitingRoomTVPage } from './pages/WaitingRoomTVPage';
import { ReceptionistDashboard } from './pages/ReceptionistDashboard';
import { DoctorDeskPage } from './pages/DoctorDeskPage';
import { AnalyticsReportPage } from './pages/AnalyticsReportPage';
import { api } from './services/api';

function MainApp() {
  const [activeTab, setActiveTab] = useState('book');
  const [clinic, setClinic] = useState(null);
  const [trackedTokenNumber, setTrackedTokenNumber] = useState('104');

  useEffect(() => {
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

  const handleNavigateToTracker = (tokenNum = '104') => {
    if (tokenNum) setTrackedTokenNumber(tokenNum);
    setActiveTab('track');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Navbar is hidden when on Waiting Room TV mode for full immersion, or visible on hover */}
      {activeTab !== 'tv' && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          clinic={clinic}
        />
      )}

      {/* Main Routed Page Content */}
      <main className="flex-1">
        {activeTab === 'book' && (
          <PatientBookingPage onNavigateToTracker={handleNavigateToTracker} />
        )}

        {activeTab === 'track' && (
          <PatientQueueTracker initialTokenNumber={trackedTokenNumber} />
        )}

        {activeTab === 'tv' && (
          <div>
            {/* Quick exit TV mode button for desktop demo */}
            <div className="bg-slate-900/80 px-4 py-2 flex items-center justify-between border-b border-slate-800 text-xs">
              <span className="text-slate-400">
                📺 <strong>Waiting Room TV Mode Active:</strong> Running 100% full-width signage.
              </span>
              <button
                onClick={() => setActiveTab('reception')}
                className="text-cyan-400 hover:text-white font-semibold underline"
              >
                ← Return to Staff Dashboard
              </button>
            </div>
            <WaitingRoomTVPage clinic={clinic} />
          </div>
        )}

        {activeTab === 'reception' && (
          <ReceptionistDashboard
            clinic={clinic}
            onNavigateToTracker={handleNavigateToTracker}
          />
        )}

        {activeTab === 'doctor' && (
          <DoctorDeskPage />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsReportPage />
        )}
      </main>

      {/* Real-time SMS & WhatsApp Push Notification Toasts */}
      <NotificationToast />

      {/* Footer */}
      {activeTab !== 'tv' && (
        <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              🏥 <strong>Apollo Care</strong> • Hospital Appointment & Queue Management System
            </p>
            <p className="font-mono text-[11px] text-slate-400">
              12-Week Solo Build Plan • Major Academic Project & Clinic Pilot
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainApp />
      </SocketProvider>
    </AuthProvider>
  );
}
