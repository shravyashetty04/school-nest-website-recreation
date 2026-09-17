import express from 'express';
import { createStudent, getStudents, getStudentById, updateStudent, deleteStudent } from '../controllers/studentController';
import { protect, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), createStudent)
  .get(getStudents); // Teachers/Parents might also need this, handled in controller/logic later

router
  .route('/:id')
  .get(getStudentById)
  .put(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), updateStudent)
  .delete(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), deleteStudent);

export default router;
