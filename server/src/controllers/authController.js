import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'hospital_queue_super_secret_jwt_key_2026';

export const login = (req, res) => {
  try {
    const rawIdentifier = (req.body.email || req.body.identifier || req.body.phone || '').toString().trim();
    const password = (req.body.password || '').toString().trim();
    const role = req.body.role;

    if (!rawIdentifier || !password) {
      return res.status(400).json({ error: 'Email or phone number and password are required' });
    }

    // Lookup by email or phone
    const user = db.findUserByEmail(rawIdentifier) || db.findUserByPhone(rawIdentifier);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email/phone and password.' });
    }

    // If a role was specified during login, ensure it matches
    if (role && role !== 'all' && user.role !== role) {
      return res.status(403).json({
        error: `Account found, but registered as ${user.role}. Please select the correct portal or sign in as ${user.role}.`
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        doctorId: user.doctorId || null
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        doctorId: user.doctorId || null,
        avatar: user.avatar || (user.role === 'doctor' ? '👨‍⚕️' : user.role === 'admin' ? '🛡️' : user.role === 'receptionist' ? '👩‍💼' : '🧑')
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login. Please try again.' });
  }
};

export const register = (req, res) => {
  try {
    const name = (req.body.name || '').toString().trim();
    const email = (req.body.email || '').toString().trim().toLowerCase();
    const phone = (req.body.phone || '').toString().trim();
    const password = (req.body.password || '').toString().trim();
    const role = req.body.role || 'patient';
    const { patientAge, patientGender } = req.body;

    if (!name || (!email && !phone) || !password) {
      return res.status(400).json({ error: 'Full name, contact (email or phone), and password are required' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long' });
    }

    // Check if email or phone already registered
    if (email && db.findUserByEmail(email)) {
      return res.status(400).json({ error: 'An account with this email address is already registered' });
    }
    if (phone && db.findUserByPhone(phone)) {
      return res.status(400).json({ error: 'An account with this phone number is already registered' });
    }

    const cleanDigits = phone.replace(/\D/g, '');
    const defaultEmail = email || `${cleanDigits || Date.now()}@patient.mediq.health`;

    // Double-check generated fallback email isn't already taken
    if (!email && db.findUserByEmail(defaultEmail)) {
      return res.status(400).json({ error: 'An account with this phone number is already registered' });
    }

    const newUser = db.createUser({
      name,
      email: defaultEmail,
      phone,
      password,
      role,
      patientAge: patientAge || null,
      patientGender: patientGender || 'Other',
      avatar: role === 'doctor' ? '👨‍⚕️' : role === 'admin' ? '🛡️' : role === 'receptionist' ? '👩‍💼' : '🧑'
    });

    const token = jwt.sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        doctorId: newUser.doctorId || null
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        avatar: newUser.avatar
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'An account with this email or phone number already exists.' });
    }
    return res.status(500).json({ error: 'Registration failed on the server. Please try again.' });
  }
};

export const getCurrentUser = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = db.findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      doctorId: user.doctorId || null,
      avatar: user.avatar
    }
  });
};

export const getOnlineUsers = (req, res) => {
  const getter = req.app.get('getOnlineUsers');
  const onlineUsers = getter ? getter() : [];
  return res.json({ onlineUsers });
};

export const verifyPatientOTP = (req, res) => {
  const { phone, otp } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  // Realistic fast-verify: any 4 or 6 digit code or '1234' is accepted for solo build demonstration
  if (otp && (otp.length >= 4 || otp === '1234')) {
    return res.json({
      verified: true,
      phone,
      message: 'Mobile number verified successfully'
    });
  }

  return res.status(400).json({ verified: false, error: 'Please enter a valid OTP code (Demo OTP: 1234)' });
};

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    // Admin always has superuser access to every route
    if (req.user.role === 'admin') {
      return next();
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
};
