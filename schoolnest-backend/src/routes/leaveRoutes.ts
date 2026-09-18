import express from 'express';
import { applyForLeave, getLeaves, updateLeaveStatus } from '../controllers/leaveController';
import { protect, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('TEACHER', 'STUDENT'), applyForLeave)
  .get(getLeaves);

router
  .route('/:id/status')
  .put(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), updateLeaveStatus);

export default router;
