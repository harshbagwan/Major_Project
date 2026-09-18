import { db } from '../config/db.js';
import { notificationService } from '../services/notificationService.js';

export const getQueueTokens = (req, res) => {
  const { doctorId, status } = req.query;
  const tokens = db.getQueueTokens({ doctorId, status });
  res.json({ tokens });
};

export const createWalkInToken = (req, res) => {
  const { patientName, patientPhone, patientAge, patientGender, doctorId, reason, isEmergency, isSenior } = req.body;

  if (!patientName || !patientPhone || !doctorId) {
    return res.status(400).json({ error: 'Patient name, phone, and doctor selection are required' });
  }

  const doctor = db.getDoctorById(doctorId);
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  const token = db.createQueueToken({
    tokenType: isEmergency ? 'emergency' : 'walk_in',
    patientName,
    patientPhone,
    patientAge: Number(patientAge) || null,
    patientGender: patientGender || 'Other',
    reason: reason || 'Walk-in Consultation',
    doctorId,
    roomNumber: doctor.roomNumber,
    isEmergency: !!isEmergency,
    isSenior: !!isSenior
  });

  // Send WhatsApp confirmation with live tracking link
  notificationService.notifyTokenGenerated(token, doctor);

  // Broadcast to all screens
  if (req.app.get('io')) {
    const io = req.app.get('io');
    io.emit('TOKEN_CREATED', token);
    io.emit('QUEUE_UPDATED', { doctorId });
  }

  res.status(201).json({
    message: 'Walk-in token generated successfully!',
    token
  });
};

export const callNextToken = (req, res) => {
  const { doctorId, specificTokenId } = req.body;

  if (!doctorId) {
    return res.status(400).json({ error: 'Doctor ID is required' });
  }

  const doctor = db.getDoctorById(doctorId);
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  // Find target token
  let nextToken = null;
  if (specificTokenId) {
    nextToken = db.getQueueTokenById(specificTokenId);
  } else {
    // Get next waiting token sorted by priority then check-in time
    const waitingTokens = db.getQueueTokens({ doctorId, status: 'waiting' });
    if (waitingTokens.length > 0) {
      nextToken = waitingTokens[0];
    }
  }

  if (!nextToken) {
    return res.status(404).json({ error: 'No patients currently waiting in queue for this doctor' });
  }

  // If doctor is currently serving another token, mark previous token completed
  const currentTokens = db.getQueueTokens({ doctorId, status: ['serving', 'called'] });
  currentTokens.forEach(tok => {
    if (tok.id !== nextToken.id) {
      db.updateQueueToken(tok.id, {
        status: 'completed',
        completedTime: new Date().toISOString()
      });
    }
  });

  // Calculate waiting time
  const now = new Date();
  const waitMinutes = nextToken.checkInTime ? Math.max(1, Math.round((now - new Date(nextToken.checkInTime)) / 60000)) : 10;

  // Update token to called / serving
  const updatedToken = db.updateQueueToken(nextToken.id, {
    status: 'serving',
    calledTime: now.toISOString(),
    waitTimeMinutes: waitMinutes
  });

  // Update doctor's current serving pointer
  db.updateDoctor(doctorId, { currentServingTokenId: updatedToken.id });

  // Send WhatsApp/SMS "It's your turn!"
  notificationService.notifyTokenCalled(updatedToken, doctor);

  // Check next patients in line (tokens 2 & 3 away) and notify them
  const remainingWaiting = db.getQueueTokens({ doctorId, status: 'waiting' });
  remainingWaiting.slice(0, 2).forEach((upToken, index) => {
    notificationService.notifyUpcomingTurn(upToken, doctor, index + 1);
  });

  // Emit Real-time Socket Event to TV Display, Doctor Desk, Receptionist, and Patient Trackers!
  if (req.app.get('io')) {
    const io = req.app.get('io');
    io.emit('TOKEN_CALLED', {
      token: updatedToken,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialization: doctor.specialization,
        roomNumber: doctor.roomNumber
      }
    });
    io.emit('QUEUE_UPDATED', { doctorId });
  }

  res.json({
    message: `Now serving Token ${updatedToken.displayToken}`,
    token: updatedToken,
    doctor
  });
};

export const recallToken = (req, res) => {
  const { tokenId } = req.body;
  const token = db.getQueueTokenById(tokenId);
  if (!token) return res.status(404).json({ error: 'Token not found' });

  const doctor = db.getDoctorById(token.doctorId);

  // Send reminder ping
  if (doctor) {
    notificationService.notifyTokenCalled(token, doctor);
  }

  // Emit audio chime event to TV and client screens
  if (req.app.get('io')) {
    req.app.get('io').emit('TOKEN_RECALLED', { token, doctor });
  }

  res.json({ message: `Token ${token.displayToken} recalled with chime alert!`, token });
};

export const completeToken = (req, res) => {
  const { tokenId, diagnosis, prescription, vitals, notes, followUpDate } = req.body;
  const token = db.getQueueTokenById(tokenId);
  if (!token) return res.status(404).json({ error: 'Token not found' });

  const now = new Date();
  const serviceMinutes = token.calledTime ? Math.max(2, Math.round((now - new Date(token.calledTime)) / 60000)) : 8;

  const updatedToken = db.updateQueueToken(token.id, {
    status: 'completed',
    completedTime: now.toISOString(),
    serviceTimeMinutes: serviceMinutes,
    notes: notes || ''
  });

  // Save consultation notes
  const consultRecord = db.createConsultation({
    tokenId: token.id,
    doctorId: token.doctorId,
    patientName: token.patientName,
    diagnosis: diagnosis || 'Routine Checkup Completed',
    prescription: prescription || '',
    vitals: vitals || {},
    notes: notes || '',
    followUpDate: followUpDate || null
  });

  // Clear doctor current serving pointer
  const doctor = db.getDoctorById(token.doctorId);
  if (doctor && doctor.currentServingTokenId === token.id) {
    db.updateDoctor(token.doctorId, { currentServingTokenId: null });
  }

  // Socket broadcast
  if (req.app.get('io')) {
    const io = req.app.get('io');
    io.emit('TOKEN_COMPLETED', { token: updatedToken, consultation: consultRecord });
    io.emit('QUEUE_UPDATED', { doctorId: token.doctorId });
  }

  res.json({
    message: `Consultation completed for Token ${updatedToken.displayToken}`,
    token: updatedToken,
    consultation: consultRecord
  });
};

export const markNoShow = (req, res) => {
  const { tokenId } = req.body;
  const token = db.getQueueTokenById(tokenId);
  if (!token) return res.status(404).json({ error: 'Token not found' });

  const updated = db.updateQueueToken(token.id, {
    status: 'no_show',
    completedTime: new Date().toISOString()
  });

  const doctor = db.getDoctorById(token.doctorId);
  if (doctor && doctor.currentServingTokenId === token.id) {
    db.updateDoctor(token.doctorId, { currentServingTokenId: null });
  }

  if (req.app.get('io')) {
    const io = req.app.get('io');
    io.emit('TOKEN_NO_SHOW', updated);
    io.emit('QUEUE_UPDATED', { doctorId: token.doctorId });
  }

  res.json({ message: `Token ${token.displayToken} marked as No-Show`, token: updated });
};

export const reorderPriority = (req, res) => {
  const { tokenId, isEmergency, isSenior } = req.body;
  const token = db.getQueueTokenById(tokenId);
  if (!token) return res.status(404).json({ error: 'Token not found' });

  const priorityLevel = isEmergency ? 3 : isSenior ? 2 : 1;
  const updated = db.updateQueueToken(token.id, { priorityLevel });

  if (req.app.get('io')) {
    req.app.get('io').emit('QUEUE_UPDATED', { doctorId: token.doctorId });
  }

  res.json({ message: 'Token priority updated', token: updated });
};

// Public Patient Live Queue Tracker Endpoint
export const getTokenStatus = (req, res) => {
  const { identifier } = req.params; // Can be tokenNumber or displayToken (e.g. 104 or T-104)
  const token = db.getQueueTokenById(identifier);

  if (!token) {
    return res.status(404).json({ error: 'Token not found or expired. Please check your token number.' });
  }

  const doctor = db.getDoctorById(token.doctorId);
  const allDocTokens = db.getQueueTokens({ doctorId: token.doctorId });

  // Find currently serving token
  const currentlyServing = allDocTokens.find(t => t.status === 'serving' || t.status === 'called');

  // Calculate position among waiting tokens
  const waitingTokens = allDocTokens.filter(t => t.status === 'waiting');
  const indexInQueue = waitingTokens.findIndex(t => t.id === token.id);

  let tokensAhead = 0;
  let statusText = 'Waiting in line';
  let estimatedWaitMins = 0;

  if (token.status === 'serving' || token.status === 'called') {
    tokensAhead = 0;
    statusText = "It's Your Turn! Please Enter Doctor's Room";
    estimatedWaitMins = 0;
  } else if (token.status === 'completed') {
    tokensAhead = 0;
    statusText = 'Consultation Completed';
    estimatedWaitMins = 0;
  } else if (token.status === 'no_show') {
    tokensAhead = 0;
    statusText = 'Marked as Absent / Missed Call';
    estimatedWaitMins = 0;
  } else {
    tokensAhead = indexInQueue >= 0 ? indexInQueue + 1 : waitingTokens.length;
    estimatedWaitMins = tokensAhead * 12;
    if (tokensAhead === 1) {
      statusText = 'You are NEXT in line! Please stand near the door.';
    } else {
      statusText = `${tokensAhead} patient(s) ahead of you`;
    }
  }

  res.json({
    token,
    doctor: doctor ? {
      name: doctor.name,
      specialization: doctor.specialization,
      roomNumber: doctor.roomNumber,
      avatarUrl: doctor.avatarUrl
    } : null,
    currentServing: currentlyServing ? {
      tokenNumber: currentlyServing.tokenNumber,
      displayToken: currentlyServing.displayToken,
      calledTime: currentlyServing.calledTime
    } : null,
    tokensAhead,
    estimatedWaitMins,
    statusText
  });
};
