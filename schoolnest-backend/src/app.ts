import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import demoRoutes from './routes/demoRoutes';
import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import feeRoutes from './routes/feeRoutes';
import classRoutes from './routes/classRoutes';
import subjectRoutes from './routes/subjectRoutes';
import teacherRoutes from './routes/teacherRoutes';
import parentRoutes from './routes/parentRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import timetableRoutes from './routes/timetableRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import examRoutes from './routes/examRoutes';
import resultRoutes from './routes/resultRoutes';
import announcementRoutes from './routes/announcementRoutes';
import notificationRoutes from './routes/notificationRoutes';
import leaveRoutes from './routes/leaveRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/request-demo', demoRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/fees', feeRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/teachers', teacherRoutes);
app.use('/api/v1/parents', parentRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/timetable', timetableRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/exams', examRoutes);
app.use('/api/v1/results', resultRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/leaves', leaveRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/admin/demo-requests', demoRoutes); // We can route this to the same router or a different one

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Global Error Handler
app.use(errorHandler);

export default app;
