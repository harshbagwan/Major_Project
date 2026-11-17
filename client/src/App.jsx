import React, { useState, useEffect } from 'react';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { NotificationToast } from './components/NotificationToast';
import { PatientBookingPage } from './pages/PatientBookingPage';
import { PatientQueueTracker } from './pages/PatientQueueTracker';
import { WaitingRoomTVPage } from './pages/WaitingRoomTVPage';
import { ReceptionistDashboard } from './pages/ReceptionistDashboard';
import { DoctorDeskPage } from './pages/DoctorDeskPage';
import { AnalyticsReportPage } from './pages/AnalyticsReportPage';
import { api } from './services/api';
import { Lock, Stethoscope, Users, Shield, ArrowRight } from 'lucide-react';

function RestrictedAccessCard({ title, description, requiredRole, onLoginClick }) {
  return (
    <div className="max-w-md mx-auto my-16 px-4 animate-fade-in text-center">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto mb-4 shadow-2xs">
          <Lock size={26} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          {description}
        </p>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2">
          <button
            onClick={onLoginClick}
            className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition shadow-xs flex items-center justify-center gap-2"
          >
            <span>Sign In as {requiredRole}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const { user, isAdmin, isDoctor, isReceptionist, canAccessTab, openLoginModal } = useAuth();
  const [activeTab, setActiveTab] = useState('book');
  const [clinic, setClinic] = useState(null);
  const [trackedTokenNumber, setTrackedTokenNumber] = useState('104');

  // Auto-switch landing tab when a specific role is logged in
  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'book') {
      setActiveTab('analytics');
    } else if (user?.role === 'doctor' && activeTab === 'book') {
      setActiveTab('doctor');
    } else if (user?.role === 'receptionist' && activeTab === 'book') {
      setActiveTab('reception');
    }
  }, [user]);

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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans selection:bg-teal-500 selection:text-white">
      {/* Navbar is hidden when on Waiting Room TV mode for lobby immersion */}
      {activeTab !== 'tv' && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          clinic={clinic}
        />
      )}

      {/* Main Routed Page Content with Role Protection */}
      <main className="flex-1">
        {activeTab === 'book' && (
          <PatientBookingPage onNavigateToTracker={handleNavigateToTracker} />
        )}

        {activeTab === 'track' && (
          <PatientQueueTracker initialTokenNumber={trackedTokenNumber} />
        )}

        {activeTab === 'tv' && (
          <div>
            <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800 text-xs text-white">
              <span className="text-slate-300">
                📺 <strong>Waiting Room TV Signage Board</strong>
              </span>
              <button
                onClick={() => {
                  if (isAdmin) setActiveTab('analytics');
                  else if (isDoctor) setActiveTab('doctor');
                  else if (isReceptionist) setActiveTab('reception');
                  else setActiveTab('track');
                }}
                className="text-teal-400 hover:text-white font-semibold underline"
              >
                ← Return to Portal
              </button>
            </div>
            <WaitingRoomTVPage clinic={clinic} />
          </div>
        )}

        {activeTab === 'reception' && (
          canAccessTab('reception') ? (
            <ReceptionistDashboard
              clinic={clinic}
              onNavigateToTracker={handleNavigateToTracker}
            />
          ) : (
            <RestrictedAccessCard
              title="Reception Desk Access Restricted"
              description="The Front Desk portal is restricted to clinic staff and receptionists to generate walk-in slips, check in online appointments, and manage priority triage."
              requiredRole="Receptionist or Admin"
              onLoginClick={() => openLoginModal('reception')}
            />
          )
        )}

        {activeTab === 'doctor' && (
          canAccessTab('doctor') ? (
            <DoctorDeskPage />
          ) : (
            <RestrictedAccessCard
              title="Doctor OPD Desk Access Restricted"
              description="The Clinical Consultation Desk is restricted to registered medical doctors to call patients into chambers, record vitals, and issue digital prescriptions."
              requiredRole="Doctor or Admin"
              onLoginClick={() => openLoginModal('doctor')}
            />
          )
        )}

        {activeTab === 'analytics' && (
          canAccessTab('analytics') ? (
            <AnalyticsReportPage />
          ) : (
            <RestrictedAccessCard
              title="Operations Analytics Restricted"
              description="Real-time clinic throughput analytics, viva evaluation reports, database DDL schema, and SMS audit logs are restricted to Hospital Administrators."
              requiredRole="Administrator"
              onLoginClick={() => openLoginModal('analytics')}
            />
          )
        )}
      </main>

      {/* Real-time SMS & WhatsApp Push Notification Toasts */}
      <NotificationToast />

      {/* Human-Centered Academic Footer */}
      {activeTab !== 'tv' && (
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mt-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-slate-600">
              🏥 <strong className="text-slate-800">MediQ</strong> • Hospital Appointment & OPD Queue System
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Major Academic Project • Department of CSE (Cybersecurity) • Final Year 2026
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SocketProvider>
  );
}
