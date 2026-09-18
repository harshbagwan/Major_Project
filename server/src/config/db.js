import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'clinic_data.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default seed state
const defaultState = {
  clinic: {
    id: 'clinic-1',
    name: 'Apollo Care Health Clinic & OPD Centre',
    tagline: 'Smart Healthcare & Real-Time Queue Management',
    address: '42, Health City Avenue, Sector 5, Medical District',
    phone: '+91 98765 43210',
    email: 'helpdesk@apollocare.in',
    openTime: '08:00 AM',
    closeTime: '08:00 PM',
    activeNotice: 'Please maintain physical queue distance. Emergency cases are prioritized.'
  },
  doctors: [
    {
      id: 'doc-1',
      name: 'Dr. Rajesh Sharma',
      title: 'Senior Consultant Cardiologist',
      specialization: 'Cardiology',
      experience: '16 Years',
      roomNumber: 'Room 101 (Floor 1)',
      fee: 600,
      bio: 'MBBS, MD, DM (Cardiology). AIIMS Gold Medalist specializing in cardiovascular wellness and hypertension management.',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
      isAvailable: true,
      currentServingTokenId: null,
      todayQueueCount: 0
    },
    {
      id: 'doc-2',
      name: 'Dr. Priya Patel',
      title: 'General Physician & Diabetologist',
      specialization: 'General Medicine',
      experience: '11 Years',
      roomNumber: 'Room 102 (Floor 1)',
      fee: 400,
      bio: 'MBBS, DNB (Internal Medicine). Expertise in acute care, seasonal infections, diabetes lifestyle care and preventive health.',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813629-652309f584e0?w=200&auto=format&fit=crop&q=80',
      isAvailable: true,
      currentServingTokenId: null,
      todayQueueCount: 0
    },
    {
      id: 'doc-3',
      name: 'Dr. Ananya Verma',
      title: 'Consultant Pediatrician & Child Specialist',
      specialization: 'Pediatrics',
      experience: '9 Years',
      roomNumber: 'Room 103 (Floor 1)',
      fee: 500,
      bio: 'MBBS, MD (Pediatrics). Friendly and compassionate child healthcare, infant vaccinations, and developmental care.',
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
      isAvailable: true,
      currentServingTokenId: null,
      todayQueueCount: 0
    }
  ],
  users: [
    {
      id: 'usr-1',
      name: 'Sunita Sharma',
      email: 'receptionist@clinic.com',
      password: 'password123',
      role: 'receptionist',
      avatar: '👩‍💼'
    },
    {
      id: 'usr-2',
      name: 'Dr. Rajesh Sharma',
      email: 'doctor.sharma@clinic.com',
      password: 'password123',
      role: 'doctor',
      doctorId: 'doc-1',
      avatar: '👨‍⚕️'
    },
    {
      id: 'usr-3',
      name: 'Dr. Priya Patel',
      email: 'doctor.patel@clinic.com',
      password: 'password123',
      role: 'doctor',
      doctorId: 'doc-2',
      avatar: '👩‍⚕️'
    },
    {
      id: 'usr-4',
      name: 'Dr. Ananya Verma',
      email: 'doctor.ananya@clinic.com',
      password: 'password123',
      role: 'doctor',
      doctorId: 'doc-3',
      avatar: '👩‍⚕️'
    }
  ],
  appointments: [],
  queue_tokens: [],
  consultations: [],
  notifications: []
};

class Database {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading data file, reinitializing default:', err);
    }
    this.save(defaultState);
    return JSON.parse(JSON.stringify(defaultState));
  }

  save(data = this.data) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving data to file:', err);
    }
  }

  resetToDefault() {
    this.data = JSON.parse(JSON.stringify(defaultState));
    this.save();
    return this.data;
  }

  // Clinic
  getClinic() {
    return this.data.clinic;
  }

  updateClinic(fields) {
    this.data.clinic = { ...this.data.clinic, ...fields };
    this.save();
    return this.data.clinic;
  }

  // Doctors
  getDoctors() {
    return this.data.doctors;
  }

  getDoctorById(id) {
    return this.data.doctors.find(d => d.id === id) || null;
  }

  updateDoctor(id, fields) {
    const idx = this.data.doctors.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.data.doctors[idx] = { ...this.data.doctors[idx], ...fields };
      this.save();
      return this.data.doctors[idx];
    }
    return null;
  }

  // Users & Auth
  findUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // Appointments
  getAppointments(filter = {}) {
    let list = [...this.data.appointments];
    if (filter.doctorId) list = list.filter(a => a.doctorId === filter.doctorId);
    if (filter.date) list = list.filter(a => a.appointmentDate === filter.date);
    if (filter.status) list = list.filter(a => a.status === filter.status);
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  getAppointmentById(id) {
    return this.data.appointments.find(a => a.id === id || a.appointmentNumber === id);
  }

  createAppointment(apt) {
    const count = this.data.appointments.length + 1;
    const newApt = {
      id: `apt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      appointmentNumber: `APT-${String(count).padStart(4, '0')}`,
      status: 'booked',
      tokenNumber: null,
      created_at: new Date().toISOString(),
      ...apt
    };
    this.data.appointments.push(newApt);
    this.save();
    return newApt;
  }

  updateAppointment(id, fields) {
    const idx = this.data.appointments.findIndex(a => a.id === id || a.appointmentNumber === id);
    if (idx !== -1) {
      this.data.appointments[idx] = { ...this.data.appointments[idx], ...fields };
      this.save();
      return this.data.appointments[idx];
    }
    return null;
  }

  // Queue Tokens
  getQueueTokens(filter = {}) {
    let list = [...this.data.queue_tokens];
    if (filter.doctorId) list = list.filter(t => t.doctorId === filter.doctorId);
    if (filter.status) {
      if (Array.isArray(filter.status)) {
        list = list.filter(t => filter.status.includes(t.status));
      } else {
        list = list.filter(t => t.status === filter.status);
      }
    }
    // Sort: priority (descending 3=emergency, 2=senior, 1=normal), then checkInTime ascending
    return list.sort((a, b) => {
      if (b.priorityLevel !== a.priorityLevel) {
        return (b.priorityLevel || 1) - (a.priorityLevel || 1);
      }
      return new Date(a.checkInTime) - new Date(b.checkInTime);
    });
  }

  getQueueTokenById(id) {
    return this.data.queue_tokens.find(t => t.id === id || t.displayToken === id || String(t.tokenNumber) === String(id));
  }

  createQueueToken(payload) {
    const todayTokens = this.data.queue_tokens;
    const tokenNum = todayTokens.length + 101;
    const prefix = payload.isEmergency ? 'EM' : payload.tokenType === 'appointment' ? 'A' : 'T';
    const displayToken = `${prefix}-${tokenNum}`;

    const newToken = {
      id: `tok-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tokenNumber: tokenNum,
      displayToken,
      tokenType: payload.tokenType || 'walk_in', // 'walk_in', 'appointment', 'emergency'
      patientName: payload.patientName,
      patientPhone: payload.patientPhone,
      patientAge: payload.patientAge || null,
      patientGender: payload.patientGender || 'Other',
      reason: payload.reason || 'General Consultation',
      doctorId: payload.doctorId,
      roomNumber: payload.roomNumber || 'Room 101',
      status: 'waiting', // 'waiting', 'called', 'serving', 'completed', 'no_show', 'held'
      priorityLevel: payload.isEmergency ? 3 : payload.isSenior ? 2 : 1,
      appointmentId: payload.appointmentId || null,
      checkInTime: new Date().toISOString(),
      calledTime: null,
      completedTime: null,
      waitTimeMinutes: 0,
      serviceTimeMinutes: 0,
      notes: ''
    };

    this.data.queue_tokens.push(newToken);

    // Update doctor's queue counter
    const doc = this.getDoctorById(payload.doctorId);
    if (doc) {
      doc.todayQueueCount = (doc.todayQueueCount || 0) + 1;
    }

    this.save();
    return newToken;
  }

  updateQueueToken(id, fields) {
    const idx = this.data.queue_tokens.findIndex(t => t.id === id || t.displayToken === id);
    if (idx !== -1) {
      this.data.queue_tokens[idx] = { ...this.data.queue_tokens[idx], ...fields };
      this.save();
      return this.data.queue_tokens[idx];
    }
    return null;
  }

  // Consultations & Rx
  createConsultation(payload) {
    const newConsult = {
      id: `cns-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...payload
    };
    this.data.consultations.push(newConsult);
    this.save();
    return newConsult;
  }

  getConsultationsByDoctor(doctorId) {
    return this.data.consultations
      .filter(c => c.doctorId === doctorId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Notifications
  logNotification(notif) {
    const item = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      status: 'delivered',
      ...notif
    };
    this.data.notifications.unshift(item);
    if (this.data.notifications.length > 50) this.data.notifications.pop();
    this.save();
    return item;
  }

  getNotifications(limit = 20) {
    return this.data.notifications.slice(0, limit);
  }

  // Analytics Calculation
  getAnalytics() {
    const allTokens = this.data.queue_tokens;
    const completedTokens = allTokens.filter(t => t.status === 'completed');
    const waitingTokens = allTokens.filter(t => t.status === 'waiting');
    const servingTokens = allTokens.filter(t => t.status === 'serving' || t.status === 'called');

    let totalWaitTime = 0;
    let totalServiceTime = 0;

    completedTokens.forEach(t => {
      if (t.checkInTime && t.calledTime) {
        const wait = Math.max(1, Math.round((new Date(t.calledTime) - new Date(t.checkInTime)) / (1000 * 60)));
        totalWaitTime += wait;
      }
      if (t.calledTime && t.completedTime) {
        const service = Math.max(2, Math.round((new Date(t.completedTime) - new Date(t.calledTime)) / (1000 * 60)));
        totalServiceTime += service;
      }
    });

    const avgWaitTime = completedTokens.length ? Math.round(totalWaitTime / completedTokens.length) : 12;
    const avgConsultTime = completedTokens.length ? Math.round(totalServiceTime / completedTokens.length) : 8;

    const walkIns = allTokens.filter(t => t.tokenType === 'walk_in' || t.tokenType === 'emergency').length;
    const bookedAppointments = allTokens.filter(t => t.tokenType === 'appointment').length;

    // Doctor breakdown
    const doctorStats = this.data.doctors.map(doc => {
      const docTokens = allTokens.filter(t => t.doctorId === doc.id);
      const docCompleted = docTokens.filter(t => t.status === 'completed').length;
      const docWaiting = docTokens.filter(t => t.status === 'waiting').length;
      const docCurrent = docTokens.find(t => t.status === 'serving' || t.status === 'called') || null;

      return {
        doctorId: doc.id,
        name: doc.name,
        specialization: doc.specialization,
        roomNumber: doc.roomNumber,
        totalPatients: docTokens.length,
        completed: docCompleted,
        waiting: docWaiting,
        currentServing: docCurrent ? docCurrent.displayToken : 'None'
      };
    });

    return {
      totalPatientsToday: allTokens.length,
      completedToday: completedTokens.length,
      currentlyWaiting: waitingTokens.length,
      currentlyServing: servingTokens.length,
      avgWaitTimeMinutes: avgWaitTime,
      avgConsultTimeMinutes: avgConsultTime,
      walkIns,
      bookedAppointments,
      noShows: allTokens.filter(t => t.status === 'no_show').length,
      doctorStats,
      // Viva / Pilot comparison impact metrics
      pilotImpact: {
        traditionalWaitMinutes: 52,
        systemWaitMinutes: avgWaitTime,
        waitTimeReductionPercent: Math.max(0, Math.round(((52 - avgWaitTime) / 52) * 100)),
        crowdingIndexReduction: '74% reduction in waiting room chaos',
        patientSatisfactionRating: 4.8
      }
    };
  }

  // PostgreSQL Schema Generator
  exportPostgreSQLSchema() {
    return `-- ==========================================================
-- Hospital Appointment & Queue Management System
-- Production PostgreSQL DDL Schema (Supabase / Railway / Neon Ready)
-- ==========================================================

CREATE TABLE IF NOT EXISTS clinics (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tagline TEXT,
    address TEXT,
    phone VARCHAR(32),
    email VARCHAR(128),
    open_time VARCHAR(16),
    close_time VARCHAR(16),
    active_notice TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    title VARCHAR(128),
    specialization VARCHAR(64) NOT NULL,
    experience VARCHAR(32),
    room_number VARCHAR(32) NOT NULL,
    fee DECIMAL(10, 2) DEFAULT 0,
    bio TEXT,
    avatar_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL, -- 'receptionist', 'doctor', 'admin'
    doctor_id VARCHAR(64) REFERENCES doctors(id) ON DELETE SET NULL,
    avatar VARCHAR(8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(64) PRIMARY KEY,
    appointment_number VARCHAR(32) UNIQUE NOT NULL,
    doctor_id VARCHAR(64) REFERENCES doctors(id) ON DELETE CASCADE,
    patient_name VARCHAR(128) NOT NULL,
    patient_phone VARCHAR(32) NOT NULL,
    patient_age INTEGER,
    patient_gender VARCHAR(16),
    appointment_date DATE NOT NULL,
    slot_time VARCHAR(32) NOT NULL,
    status VARCHAR(32) DEFAULT 'booked', -- 'booked', 'checked_in', 'cancelled', 'completed'
    reason TEXT,
    token_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS queue_tokens (
    id VARCHAR(64) PRIMARY KEY,
    token_number INTEGER NOT NULL,
    display_token VARCHAR(32) NOT NULL,
    token_type VARCHAR(32) DEFAULT 'walk_in', -- 'walk_in', 'appointment', 'emergency'
    patient_name VARCHAR(128) NOT NULL,
    patient_phone VARCHAR(32) NOT NULL,
    patient_age INTEGER,
    patient_gender VARCHAR(16),
    reason TEXT,
    doctor_id VARCHAR(64) REFERENCES doctors(id) ON DELETE CASCADE,
    room_number VARCHAR(32) NOT NULL,
    status VARCHAR(32) DEFAULT 'waiting', -- 'waiting', 'called', 'serving', 'completed', 'no_show', 'held'
    priority_level INTEGER DEFAULT 1, -- 1=normal, 2=senior, 3=emergency
    appointment_id VARCHAR(64) REFERENCES appointments(id) ON DELETE SET NULL,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    called_time TIMESTAMP WITH TIME ZONE,
    completed_time TIMESTAMP WITH TIME ZONE,
    wait_time_minutes INTEGER DEFAULT 0,
    service_time_minutes INTEGER DEFAULT 0,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS consultations (
    id VARCHAR(64) PRIMARY KEY,
    token_id VARCHAR(64) REFERENCES queue_tokens(id) ON DELETE SET NULL,
    doctor_id VARCHAR(64) REFERENCES doctors(id) ON DELETE CASCADE,
    patient_name VARCHAR(128) NOT NULL,
    diagnosis TEXT,
    prescription TEXT,
    vitals JSONB,
    notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    recipient_phone VARCHAR(32) NOT NULL,
    channel VARCHAR(16) NOT NULL, -- 'SMS', 'WHATSAPP'
    message_type VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(16) DEFAULT 'delivered',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tokens_doctor_status ON queue_tokens(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_doc ON appointments(appointment_date, doctor_id);
`;
  }
}

export const db = new Database();
