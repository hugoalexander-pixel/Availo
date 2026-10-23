import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './routes/authRoutes';
import { facilityRoutes } from './routes/facilityRoutes';
import { reservationRoutes } from './routes/reservationRoutes';
import { notificationRoutes } from './routes/notificationRoutes';
import { buildingRoutes } from './routes/buildingRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config({ path: '../../.env' });

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ Status: 'OK', Message: 'KelasKosong API berjalan.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

export default app;
