import express from 'express';
import { createTeacher, getTeachers, updateTeacher, deleteTeacher } from '../controllers/teacherController';
import { protect, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), createTeacher)
  .get(getTeachers);

router
  .route('/:id')
  .put(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), updateTeacher)
  .delete(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), deleteTeacher);

export default router;
