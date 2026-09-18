const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${BACKEND_URL}/api`;

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('apollo_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Server request failed');
    }
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Clinic & Doctors
  getClinic: () => request('/clinic'),
  getDoctors: () => request('/doctors'),
  getDoctorById: (id) => request(`/doctors/${id}`),
  toggleDoctorAvailability: (id) => request(`/doctors/${id}/toggle`, { method: 'PATCH' }),

  // Appointments
  getAppointments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/appointments${query ? `?${query}` : ''}`);
  },
  bookAppointment: (payload) => request('/appointments', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  checkInAppointment: (appointmentId) => request(`/appointments/${appointmentId}/check-in`, {
    method: 'POST'
  }),
  cancelAppointment: (id) => request(`/appointments/${id}`, {
    method: 'DELETE'
  }),

  // Queue Operations
  getQueue: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/queue${query ? `?${query}` : ''}`);
  },
  createWalkInToken: (payload) => request('/queue/walk-in', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  callNextToken: (doctorId, specificTokenId = null) => request('/queue/call-next', {
    method: 'POST',
    body: JSON.stringify({ doctorId, specificTokenId })
  }),
  recallToken: (tokenId) => request('/queue/recall', {
    method: 'POST',
    body: JSON.stringify({ tokenId })
  }),
  completeToken: (payload) => request('/queue/complete', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  markNoShow: (tokenId) => request('/queue/no-show', {
    method: 'POST',
    body: JSON.stringify({ tokenId })
  }),
  reorderPriority: (payload) => request('/queue/priority', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getTokenStatus: (identifier) => request(`/queue/token/${identifier}`),

  // Analytics & Reports
  getAnalytics: () => request('/analytics'),
  getNotifications: (limit = 20) => request(`/notifications?limit=${limit}`),
  resetDemoData: () => request('/analytics/reset', { method: 'POST' }),

  // Auth & Verification
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  verifyOTP: (payload) => request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
};
