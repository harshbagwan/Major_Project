import { db } from '../config/db.js';
import { seedInitialData } from '../seedData.js';

export const getAnalytics = (req, res) => {
  const data = db.getAnalytics();
  res.json(data);
};

export const getNotificationsLog = (req, res) => {
  const limit = Number(req.query.limit) || 25;
  const list = db.getNotifications(limit);
  res.json({ notifications: list });
};

export const resetData = (req, res) => {
  seedInitialData();
  const analytics = db.getAnalytics();

  if (req.app.get('io')) {
    req.app.get('io').emit('DATA_RESET');
    req.app.get('io').emit('QUEUE_UPDATED', {});
  }

  res.json({ message: 'Demo data reset successfully with active clinic simulation!', analytics });
};

export const getPostgresSchema = (req, res) => {
  const schema = db.exportPostgreSQLSchema();
  res.setHeader('Content-Type', 'text/plain');
  res.send(schema);
};
