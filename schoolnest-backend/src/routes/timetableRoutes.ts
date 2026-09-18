import express from 'express';
import { createTimetable, getTimetable, deleteTimetable, bulkCreateTimetable } from '../controllers/timetableController';
import { protect, authorizeRoles } from '../middlewares/auth';
import { uploadCSV } from '../middlewares/upload';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), createTimetable)
  .get(getTimetable);

router.post('/bulk', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), uploadCSV.single('file'), bulkCreateTimetable);

router
  .route('/:id')
  .delete(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), deleteTimetable);

export default router;
