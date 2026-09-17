import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDatabase, getConnectionStatus } from './config/database';
import { env } from './config/env';
import authRoutes from './routes/auth';
import courseRoutes from './routes/course.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import lectureRoutes from './routes/lecture.routes';
import liveClassRoutes from './routes/live-class.routes';
import dppRoutes from './routes/dpp.routes';
import studyMaterialRoutes from './routes/study-material.routes';
import dashboardRoutes from './routes/dashboard.routes';
import uploadRoutes from './routes/upload.routes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically (for development)
const uploadDir = path.resolve(env.UPLOAD_DIR);
app.use('/uploads', express.static(uploadDir));

// Database connection
connectDatabase().catch(console.error);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/live-classes', liveClassRoutes);
app.use('/api/dpps', dppRoutes);
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: getConnectionStatus() ? 'connected' : 'disconnected' });
});

export default app;