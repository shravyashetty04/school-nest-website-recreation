import express from 'express';
import { createTeacher, getTeachers, updateTeacher, deleteTeacher, bulkCreateTeachers } from '../controllers/teacherController';
import { protect, authorizeRoles } from '../middlewares/auth';
import { uploadCSV } from '../middlewares/upload';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), createTeacher)
  .get(getTeachers);

router.post('/bulk', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), uploadCSV.single('file'), bulkCreateTeachers);

router
  .route('/:id')
  .put(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), updateTeacher)
  .delete(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), deleteTeacher);

export default router;
