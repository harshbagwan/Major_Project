import { db } from '../config/db.js';

export const getDoctors = (req, res) => {
  const doctors = db.getDoctors();
  const tokens = db.getQueueTokens();

  // Enrich with live queue counts
  const enriched = doctors.map(doc => {
    const docTokens = tokens.filter(t => t.doctorId === doc.id);
    const waiting = docTokens.filter(t => t.status === 'waiting');
    const current = docTokens.find(t => t.status === 'serving' || t.status === 'called');

    return {
      ...doc,
      waitingCount: waiting.length,
      currentServingToken: current ? current.displayToken : 'None',
      estimatedWaitTime: waiting.length * 12 // estimated 12 mins per patient
    };
  });

  res.json({ doctors: enriched });
};

export const getDoctorById = (req, res) => {
  const doc = db.getDoctorById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Doctor not found' });
  res.json({ doctor: doc });
};

export const toggleDoctorAvailability = (req, res) => {
  const doc = db.getDoctorById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Doctor not found' });

  const updated = db.updateDoctor(req.params.id, {
    isAvailable: !doc.isAvailable
  });

  res.json({ doctor: updated, message: `Doctor is now ${updated.isAvailable ? 'Available' : 'Away'}` });
};
