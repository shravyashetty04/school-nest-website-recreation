import express from 'express';
import { submitResult, getResults } from '../controllers/resultController';
import { protect, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), submitResult)
  .get(getResults);

export default router;
