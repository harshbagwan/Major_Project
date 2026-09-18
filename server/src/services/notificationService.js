import { db } from '../config/db.js';

class NotificationService {
  constructor() {
    this.io = null;
  }

  setSocketIO(io) {
    this.io = io;
  }

  sendSMS({ phone, message, type = 'SMS_ALERT' }) {
    const record = db.logNotification({
      recipientPhone: phone,
      channel: 'SMS',
      messageType: type,
      content: message,
      status: 'delivered'
    });

    console.log(`\x1b[36m[SMS DISPATCH]\x1b[0m To: ${phone} | ${message}`);

    if (this.io) {
      this.io.emit('NOTIFICATION_DISPATCHED', record);
    }
    return record;
  }

  sendWhatsApp({ phone, message, type = 'WHATSAPP_UPDATE' }) {
    const record = db.logNotification({
      recipientPhone: phone,
      channel: 'WHATSAPP',
      messageType: type,
      content: message,
      status: 'delivered'
    });

    console.log(`\x1b[32m[WHATSAPP CLOUD]\x1b[0m To: ${phone} | ${message}`);

    if (this.io) {
      this.io.emit('NOTIFICATION_DISPATCHED', record);
    }
    return record;
  }

  // Preset notification triggers based on the 12-week spec
  notifyBookingConfirmed(appointment, doctor) {
    const msg = `🏥 *Apollo Care Clinic*: Hello ${appointment.patientName}, your appointment with ${doctor.name} (${doctor.specialization}) is confirmed for ${appointment.appointmentDate} at ${appointment.slotTime}. Booking ID: ${appointment.appointmentNumber}. Please arrive 10 mins early.`;
    this.sendWhatsApp({ phone: appointment.patientPhone, message: msg, type: 'BOOKING_CONFIRMED' });
    this.sendSMS({ phone: appointment.patientPhone, message: `Apollo Care: Appointment confirmed with ${doctor.name} on ${appointment.appointmentDate} at ${appointment.slotTime}. Ref: ${appointment.appointmentNumber}`, type: 'BOOKING_CONFIRMED' });
  }

  notifyTokenGenerated(token, doctor) {
    const msg = `🎫 *Apollo Care Clinic*: Token Generated! Your Token is *${token.displayToken}* for ${doctor.name}, ${token.roomNumber}. Track your real-time queue position on your phone here: http://localhost:5173/track/${token.tokenNumber}`;
    this.sendWhatsApp({ phone: token.patientPhone, message: msg, type: 'TOKEN_GENERATED' });
  }

  notifyUpcomingTurn(token, doctor, tokensAhead) {
    const msg = `🔔 *Apollo Care Queue Alert*: Dear ${token.patientName}, you are now *${tokensAhead}* token(s) away from your consultation with ${doctor.name}. Please stay near ${token.roomNumber}.`;
    this.sendWhatsApp({ phone: token.patientPhone, message: msg, type: 'QUEUE_ALERT' });
    this.sendSMS({ phone: token.patientPhone, message: `Apollo Care: You are ${tokensAhead} token(s) away from ${doctor.name}. Proceed to ${token.roomNumber}.`, type: 'QUEUE_ALERT' });
  }

  notifyTokenCalled(token, doctor) {
    const msg = `📢 *IT'S YOUR TURN!* Token *${token.displayToken}* (${token.patientName}), please proceed immediately into ${token.roomNumber} for consultation with ${doctor.name}.`;
    this.sendWhatsApp({ phone: token.patientPhone, message: msg, type: 'TOKEN_CALLED' });
    this.sendSMS({ phone: token.patientPhone, message: `Apollo Care: Token ${token.displayToken} called! Please enter ${token.roomNumber} now.`, type: 'TOKEN_CALLED' });
  }
}

export const notificationService = new NotificationService();
