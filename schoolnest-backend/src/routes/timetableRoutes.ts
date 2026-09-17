import express from 'express';
import { createTimetable, getTimetable, deleteTimetable } from '../controllers/timetableController';
import { protect, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), createTimetable)
  .get(getTimetable);

router
  .route('/:id')
  .delete(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), deleteTimetable);

export default router;
