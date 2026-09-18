import express from 'express';
import { createSubject, getSubjects, updateSubject, deleteSubject } from '../controllers/subjectController';
import { protect, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), createSubject)
  .get(getSubjects);

router
  .route('/:id')
  .put(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), updateSubject)
  .delete(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), deleteSubject);

export default router;
