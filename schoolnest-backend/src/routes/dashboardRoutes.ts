import express from 'express';
import { getAdminDashboardStats } from '../controllers/dashboardController';
import { protect, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router
  .route('/admin')
  .get(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), getAdminDashboardStats);

export default router;
