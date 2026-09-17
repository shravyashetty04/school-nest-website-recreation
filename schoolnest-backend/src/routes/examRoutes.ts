import express from 'express';
import { createExam, getExams, updateExam, deleteExam } from '../controllers/examController';
import { protect, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), createExam)
  .get(getExams);

router
  .route('/:id')
  .put(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), updateExam)
  .delete(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), deleteExam);

export default router;
