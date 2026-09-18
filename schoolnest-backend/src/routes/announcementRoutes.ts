import express from 'express';
import { createAnnouncement, getAnnouncements } from '../controllers/announcementController';
import { protect, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), createAnnouncement)
  .get(getAnnouncements);

export default router;
