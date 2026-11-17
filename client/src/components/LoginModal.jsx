import React, { useState } from 'react';
import { X, Lock, Mail, Phone, User, Stethoscope, Shield, UserCheck, AlertCircle, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const {
    loginWithCredentials,
    registerPatient,
    loginAsAdmin,
    loginAsReceptionist,
    loginAsDoctor,
    loginAsPatient,
    targetTabAfterLogin
  } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [selectedRole, setSelectedRole] = useState('patient'); // 'patient', 'doctor', 'receptionist', 'admin'
  const [identifier, setIdentifier] = useState(''); // email or phone
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Patient registration state
  const [regData, setRegData] = useState({
    name: '',
    phone: '',
    email: '',
    patientAge: '',
    patientGender: 'Male',
    password: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleRoleSelect = (r) => {
    setSelectedRole(r);
    setError('');
    // Helpful credential auto-hints for fast testing
    if (r === 'admin') setIdentifier('admin@mediq.health');
    else if (r === 'doctor') setIdentifier('doctor.sharma@clinic.com');
    else if (r === 'receptionist') setIdentifier('receptionist@clinic.com');
    else if (r === 'patient') setIdentifier('rohan.mehra@example.com');
    setPassword('password123');
    if (r === 'admin') setPassword('adminpassword123');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier || !password) {
      setError('Please enter your email or phone and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await loginWithCredentials(identifier.trim(), password.trim(), selectedRole);
      if (onLoginSuccess) onLoginSuccess(user, targetTabAfterLogin);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!regData.name || !regData.phone || !regData.password) {
      setError('Name, phone number, and password are required.');
      return;
    }

    if (regData.password !== regData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const user = await registerPatient(regData);
      if (onLoginSuccess) onLoginSuccess(user, targetTabAfterLogin);
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (loginFn, defaultTab) => {
    try {
      setLoading(true);
      setError('');
      const user = await loginFn();
      if (onLoginSuccess) onLoginSuccess(user, defaultTab);
      onClose();
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              🏥
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'login' ? 'Sign In to MediQ' : 'Create Patient Account'}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'login'
                  ? 'Role-based access control with secure JWT authentication'
                  : 'Register for live token tracking & prescription records'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition ${
              mode === 'login'
                ? 'border-teal-600 text-teal-800 bg-teal-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Portal Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition ${
              mode === 'register'
                ? 'border-teal-600 text-teal-800 bg-teal-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            New Patient Registration
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 shadow-2xs">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        {mode === 'login' ? (
          <div className="p-6 space-y-5">
            {/* Role Selectors */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Select Portal / Role to Access:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'patient', label: 'Patient', icon: '🧑', desc: 'Queue & Booking' },
                  { id: 'doctor', label: 'Doctor', icon: '👨‍⚕️', desc: 'OPD Desk' },
                  { id: 'receptionist', label: 'Reception', icon: '👩‍💼', desc: 'Front Desk' },
                  { id: 'admin', label: 'Admin', icon: '🛡️', desc: 'Full Control' }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id)}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      selectedRole === r.id
                        ? 'border-teal-500 bg-teal-50/70 text-teal-900 ring-2 ring-teal-200 shadow-2xs font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span className="text-xl block">{r.icon}</span>
                    <span className="text-xs font-bold block mt-1">{r.label}</span>
                    <span className="text-[10px] text-slate-500 block">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Standard Credential Inputs */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email or Mobile Number
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter email or 10-digit mobile number"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : `Sign In as ${selectedRole.toUpperCase()}`}</span>
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Preserved Demo Mode Quick-Login (College Viva Presentation) */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                <Sparkles size={13} className="text-teal-600" />
                <span>Demo & Viva Quick Access (1-Click Real Auth):</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Instantly signs in with real account tokens without manual typing:
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(loginAsAdmin, 'analytics')}
                  className="py-2 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold transition text-left flex items-center gap-2"
                >
                  <span>🛡️</span>
                  <div>
                    <span className="font-bold block">Admin</span>
                    <span className="text-[10px] text-amber-700 font-normal">All Portals + Reports</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(() => loginAsDoctor('doc-1'), 'doctor')}
                  className="py-2 px-2.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-semibold transition text-left flex items-center gap-2"
                >
                  <span>👨‍⚕️</span>
                  <div>
                    <span className="font-bold block">Dr. Rajesh</span>
                    <span className="text-[10px] text-teal-700 font-normal">Cardiology OPD Desk</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(loginAsReceptionist, 'reception')}
                  className="py-2 px-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 font-semibold transition text-left flex items-center gap-2"
                >
                  <span>👩‍💼</span>
                  <div>
                    <span className="font-bold block">Reception Desk</span>
                    <span className="text-[10px] text-sky-700 font-normal">Walk-In & Queue Triage</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(loginAsPatient, 'book')}
                  className="py-2 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-semibold transition text-left flex items-center gap-2"
                >
                  <span>🧑</span>
                  <div>
                    <span className="font-bold block">Patient Rohan</span>
                    <span className="text-[10px] text-emerald-700 font-normal">Book & Live Tracker</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Registration Form for Patients */
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Full Patient Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={regData.name}
                onChange={(e) => setRegData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Ramesh Chandra"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={regData.phone}
                  onChange={(e) => setRegData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 00000"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={regData.email}
                  onChange={(e) => setRegData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="patient@example.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={regData.patientAge}
                  onChange={(e) => setRegData(prev => ({ ...prev, patientAge: e.target.value }))}
                  placeholder="e.g. 34"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Gender</label>
                <select
                  value={regData.patientGender}
                  onChange={(e) => setRegData(prev => ({ ...prev, patientGender: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Create Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={regData.password}
                  onChange={(e) => setRegData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={regData.confirmPassword}
                  onChange={(e) => setRegData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Repeat password"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'Creating Account...' : 'Register & Start Booking'}</span>
                <CheckCircle2 size={15} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
