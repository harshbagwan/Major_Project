import { db } from '../config/db.js';
import { notificationService } from '../services/notificationService.js';

export const getAppointments = (req, res) => {
  const { doctorId, date, status } = req.query;
  const list = db.getAppointments({ doctorId, date, status });
  res.json({ appointments: list });
};

export const createAppointment = (req, res) => {
  const { patientName, patientPhone, patientAge, patientGender, doctorId, appointmentDate, slotTime, reason } = req.body;

  if (!patientName || !patientPhone || !doctorId || !appointmentDate || !slotTime) {
    return res.status(400).json({ error: 'Missing required appointment fields' });
  }

  const doctor = db.getDoctorById(doctorId);
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  const newApt = db.createAppointment({
    patientName,
    patientPhone,
    patientAge: Number(patientAge) || null,
    patientGender: patientGender || 'Other',
    doctorId,
    doctorName: doctor.name,
    specialization: doctor.specialization,
    roomNumber: doctor.roomNumber,
    appointmentDate,
    slotTime,
    reason: reason || 'General Consultation'
  });

  // Trigger SMS & WhatsApp confirmation
  notificationService.notifyBookingConfirmed(newApt, doctor);

  // If Socket.IO is initialized, emit booking event
  if (req.app.get('io')) {
    req.app.get('io').emit('APPOINTMENT_BOOKED', newApt);
  }

  res.status(201).json({
    message: 'Appointment booked successfully!',
    appointment: newApt
  });
};

export const checkInAppointment = (req, res) => {
  const apt = db.getAppointmentById(req.params.id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found' });

  if (apt.status === 'checked_in') {
    return res.status(400).json({ error: 'Patient is already checked in' });
  }

  const doctor = db.getDoctorById(apt.doctorId);

  // Generate Queue Token for this checked-in patient
  const token = db.createQueueToken({
    tokenType: 'appointment',
    patientName: apt.patientName,
    patientPhone: apt.patientPhone,
    patientAge: apt.patientAge,
    patientGender: apt.patientGender,
    reason: apt.reason,
    doctorId: apt.doctorId,
    roomNumber: doctor ? doctor.roomNumber : 'Room 101',
    appointmentId: apt.id
  });

  // Update appointment record
  const updatedApt = db.updateAppointment(apt.id, {
    status: 'checked_in',
    tokenNumber: token.tokenNumber,
    displayToken: token.displayToken
  });

  // Dispatch WhatsApp Token link
  if (doctor) {
    notificationService.notifyTokenGenerated(token, doctor);
  }

  // Real-time broadcast
  if (req.app.get('io')) {
    const io = req.app.get('io');
    io.emit('PATIENT_CHECKED_IN', { appointment: updatedApt, token });
    io.emit('QUEUE_UPDATED', { doctorId: apt.doctorId });
  }

  res.json({
    message: 'Patient checked in successfully. Token generated!',
    appointment: updatedApt,
    token
  });
};

export const cancelAppointment = (req, res) => {
  const apt = db.getAppointmentById(req.params.id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found' });

  const updated = db.updateAppointment(apt.id, { status: 'cancelled' });

  if (req.app.get('io')) {
    req.app.get('io').emit('APPOINTMENT_CANCELLED', updated);
  }

  res.json({ message: 'Appointment cancelled', appointment: updated });
};
