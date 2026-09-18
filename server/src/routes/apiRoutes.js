import express from 'express';
import { db } from '../config/db.js';
import * as authCtrl from '../controllers/authController.js';
import * as docCtrl from '../controllers/doctorController.js';
import * as aptCtrl from '../controllers/appointmentController.js';
import * as queueCtrl from '../controllers/queueController.js';
import * as analyticsCtrl from '../controllers/analyticsController.js';

const router = express.Router();

// Auth
router.post('/auth/login', authCtrl.login);
router.post('/auth/verify-otp', authCtrl.verifyPatientOTP);

// Clinic Info
router.get('/clinic', (req, res) => {
  res.json({ clinic: db.getClinic() });
});
router.patch('/clinic', (req, res) => {
  const updated = db.updateClinic(req.body);
  if (req.app.get('io')) {
    req.app.get('io').emit('CLINIC_UPDATED', updated);
  }
  res.json({ clinic: updated });
});

// Doctors
router.get('/doctors', docCtrl.getDoctors);
router.get('/doctors/:id', docCtrl.getDoctorById);
router.patch('/doctors/:id/toggle', docCtrl.toggleDoctorAvailability);

// Appointments
router.get('/appointments', aptCtrl.getAppointments);
router.post('/appointments', aptCtrl.createAppointment);
router.post('/appointments/:id/check-in', aptCtrl.checkInAppointment);
router.delete('/appointments/:id', aptCtrl.cancelAppointment);

// Queue Engine
router.get('/queue', queueCtrl.getQueueTokens);
router.post('/queue/walk-in', queueCtrl.createWalkInToken);
router.post('/queue/call-next', queueCtrl.callNextToken);
router.post('/queue/recall', queueCtrl.recallToken);
router.post('/queue/complete', queueCtrl.completeToken);
router.post('/queue/no-show', queueCtrl.markNoShow);
router.post('/queue/priority', queueCtrl.reorderPriority);
router.get('/queue/token/:identifier', queueCtrl.getTokenStatus);

// Analytics & Reports
router.get('/analytics', analyticsCtrl.getAnalytics);
router.get('/notifications', analyticsCtrl.getNotificationsLog);
router.post('/analytics/reset', analyticsCtrl.resetData);
router.get('/schema/postgresql', analyticsCtrl.getPostgresSchema);

export default router;
