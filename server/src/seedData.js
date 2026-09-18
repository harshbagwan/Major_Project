import { db } from './config/db.js';

export function seedInitialData() {
  const existingTokens = db.getQueueTokens();
  if (existingTokens.length > 0) {
    console.log('Database already populated with queue data.');
    return;
  }

  console.log('Seeding initial realistic clinic pilot data...');

  // Reset to default clinic and doctors
  db.resetToDefault();

  const todayStr = new Date().toISOString().split('T')[0];

  // Seed sample pre-booked appointments for today
  const sampleAppointments = [
    {
      patientName: 'Aarav Mehta',
      patientPhone: '+91 98231 11223',
      patientAge: 42,
      patientGender: 'Male',
      doctorId: 'doc-1',
      appointmentDate: todayStr,
      slotTime: '09:00 AM',
      reason: 'Chest pain follow-up & ECG review',
      status: 'completed'
    },
    {
      patientName: 'Meera Iyer',
      patientPhone: '+91 98765 22334',
      patientAge: 35,
      patientGender: 'Female',
      doctorId: 'doc-1',
      appointmentDate: todayStr,
      slotTime: '09:30 AM',
      reason: 'Hypertension routine checkup',
      status: 'completed'
    },
    {
      patientName: 'Rohan Deshmukh',
      patientPhone: '+91 97654 33445',
      patientAge: 29,
      patientGender: 'Male',
      doctorId: 'doc-1',
      appointmentDate: todayStr,
      slotTime: '10:00 AM',
      reason: 'Palpitations during exercise',
      status: 'checked_in'
    },
    {
      patientName: 'Ananya Sen',
      patientPhone: '+91 98112 44556',
      patientAge: 51,
      patientGender: 'Female',
      doctorId: 'doc-1',
      appointmentDate: todayStr,
      slotTime: '10:30 AM',
      reason: 'Post-stent annual consultation',
      status: 'booked'
    },
    {
      patientName: 'Kabir Verma',
      patientPhone: '+91 98334 55667',
      patientAge: 4,
      patientGender: 'Male',
      doctorId: 'doc-3',
      appointmentDate: todayStr,
      slotTime: '10:00 AM',
      reason: 'Persistent fever and cough',
      status: 'checked_in'
    },
    {
      patientName: 'Pooja Reddy',
      patientPhone: '+91 98456 66778',
      patientAge: 28,
      patientGender: 'Female',
      doctorId: 'doc-2',
      appointmentDate: todayStr,
      slotTime: '10:15 AM',
      reason: 'Type 2 Diabetes HbA1c review',
      status: 'checked_in'
    }
  ];

  const createdApts = sampleAppointments.map(a => db.createAppointment(a));

  // Seed some completed queue tokens
  const token1 = db.createQueueToken({
    tokenType: 'appointment',
    patientName: 'Aarav Mehta',
    patientPhone: '+91 98231 11223',
    patientAge: 42,
    patientGender: 'Male',
    reason: 'Chest pain follow-up & ECG review',
    doctorId: 'doc-1',
    roomNumber: 'Room 101 (Floor 1)',
    appointmentId: createdApts[0].id
  });
  db.updateQueueToken(token1.id, {
    status: 'completed',
    calledTime: new Date(Date.now() - 65 * 60000).toISOString(),
    completedTime: new Date(Date.now() - 50 * 60000).toISOString(),
    waitTimeMinutes: 14,
    serviceTimeMinutes: 15
  });

  const token2 = db.createQueueToken({
    tokenType: 'appointment',
    patientName: 'Meera Iyer',
    patientPhone: '+91 98765 22334',
    patientAge: 35,
    patientGender: 'Female',
    reason: 'Hypertension routine checkup',
    doctorId: 'doc-1',
    roomNumber: 'Room 101 (Floor 1)',
    appointmentId: createdApts[1].id
  });
  db.updateQueueToken(token2.id, {
    status: 'completed',
    calledTime: new Date(Date.now() - 48 * 60000).toISOString(),
    completedTime: new Date(Date.now() - 35 * 60000).toISOString(),
    waitTimeMinutes: 16,
    serviceTimeMinutes: 13
  });

  // Seed token currently in consultation
  const token3 = db.createQueueToken({
    tokenType: 'appointment',
    patientName: 'Rohan Deshmukh',
    patientPhone: '+91 97654 33445',
    patientAge: 29,
    patientGender: 'Male',
    reason: 'Palpitations during exercise',
    doctorId: 'doc-1',
    roomNumber: 'Room 101 (Floor 1)',
    appointmentId: createdApts[2].id
  });
  db.updateQueueToken(token3.id, {
    status: 'serving',
    calledTime: new Date(Date.now() - 8 * 60000).toISOString()
  });
  db.updateDoctor('doc-1', { currentServingTokenId: token3.id });

  // Seed waiting tokens in line
  db.createQueueToken({
    tokenType: 'walk_in',
    patientName: 'Suresh Trivedi',
    patientPhone: '+91 99123 77889',
    patientAge: 68,
    patientGender: 'Male',
    reason: 'Severe joint aches and dizziness',
    doctorId: 'doc-1',
    roomNumber: 'Room 101 (Floor 1)',
    isSenior: true
  });

  db.createQueueToken({
    tokenType: 'walk_in',
    patientName: 'Neha Gupta',
    patientPhone: '+91 99456 88990',
    patientAge: 32,
    patientGender: 'Female',
    reason: 'Shortness of breath & fatigue',
    doctorId: 'doc-1',
    roomNumber: 'Room 101 (Floor 1)'
  });

  db.createQueueToken({
    tokenType: 'walk_in',
    patientName: 'Vikram Choudhary',
    patientPhone: '+91 98877 12345',
    patientAge: 45,
    patientGender: 'Male',
    reason: 'BP spikes & headache',
    doctorId: 'doc-1',
    roomNumber: 'Room 101 (Floor 1)'
  });

  // Dr. Priya Patel queue
  const priyaToken = db.createQueueToken({
    tokenType: 'appointment',
    patientName: 'Pooja Reddy',
    patientPhone: '+91 98456 66778',
    patientAge: 28,
    patientGender: 'Female',
    reason: 'Type 2 Diabetes HbA1c review',
    doctorId: 'doc-2',
    roomNumber: 'Room 102 (Floor 1)',
    appointmentId: createdApts[5].id
  });
  db.updateQueueToken(priyaToken.id, {
    status: 'serving',
    calledTime: new Date(Date.now() - 5 * 60000).toISOString()
  });
  db.updateDoctor('doc-2', { currentServingTokenId: priyaToken.id });

  db.createQueueToken({
    tokenType: 'walk_in',
    patientName: 'Amit Saxena',
    patientPhone: '+91 98711 22334',
    patientAge: 52,
    patientGender: 'Male',
    reason: 'High fasting glucose & blurred vision',
    doctorId: 'doc-2',
    roomNumber: 'Room 102 (Floor 1)'
  });

  // Dr. Ananya Verma queue
  const ananyaToken = db.createQueueToken({
    tokenType: 'appointment',
    patientName: 'Kabir Verma (Parent: Nitin)',
    patientPhone: '+91 98334 55667',
    patientAge: 4,
    patientGender: 'Male',
    reason: 'Persistent fever and cough',
    doctorId: 'doc-3',
    roomNumber: 'Room 103 (Floor 1)',
    appointmentId: createdApts[4].id
  });
  db.updateQueueToken(ananyaToken.id, {
    status: 'serving',
    calledTime: new Date(Date.now() - 10 * 60000).toISOString()
  });
  db.updateDoctor('doc-3', { currentServingTokenId: ananyaToken.id });

  console.log('Pilot clinic seed data successfully created!');
}

if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  seedInitialData();
}
