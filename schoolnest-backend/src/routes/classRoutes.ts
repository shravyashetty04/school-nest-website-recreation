import express from 'express';
import { createClass, getClasses, updateClass, deleteClass } from '../controllers/classController';
import { protect, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), createClass)
  .get(getClasses);

router
  .route('/:id')
  .put(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), updateClass)
  .delete(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), deleteClass);

export default router;
