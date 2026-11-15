import { db } from '../config/db.js';

export const getPatientHistory = (req, res) => {
  const { phone } = req.params;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const history = db.getPatientHistory(phone);
  res.json({
    phone,
    ...history
  });
};

export const getPrescriptionByToken = (req, res) => {
  const { identifier } = req.params;
  const token = db.getQueueTokenById(identifier);
  if (!token) {
    return res.status(404).json({ error: 'Queue token not found' });
  }

  const consultation = db.getConsultationByToken(token.id);
  const doctor = db.getDoctorById(token.doctorId);
  const clinic = db.getClinic();

  if (!consultation) {
    return res.status(404).json({
      error: 'No medical prescription recorded yet for this consultation',
      token,
      doctor
    });
  }

  res.json({
    token,
    consultation,
    doctor,
    clinic
  });
};

export const getPrescriptionById = (req, res) => {
  const { id } = req.params;
  const consultation = db.getConsultationById(id);
  if (!consultation) {
    return res.status(404).json({ error: 'Prescription not found' });
  }

  const doctor = db.getDoctorById(consultation.doctorId);
  const clinic = db.getClinic();

  res.json({
    consultation,
    doctor,
    clinic
  });
};
