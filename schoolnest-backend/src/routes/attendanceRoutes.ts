import express from 'express';
import { markAttendance, getAttendance } from '../controllers/attendanceController';
import { protect, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), markAttendance)
  .get(getAttendance);

export default router;
