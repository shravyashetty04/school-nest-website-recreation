import express from 'express';
import { createAssignment, getAssignments, deleteAssignment, submitAssignment } from '../controllers/assignmentController';
import { protect, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), createAssignment)
  .get(getAssignments);

router
  .route('/:id')
  .delete(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), deleteAssignment);

router
  .route('/:id/submit')
  .post(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'STUDENT'), submitAssignment);

export default router;
