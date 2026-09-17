import { Router } from 'express';
import { requestDemo, getDemoRequests } from '../controllers/demoController';
import { protect, authorizeRoles } from '../middlewares/auth';

const router = Router();

// Public: Submit a demo request
router.post('/', requestDemo);

// Protected (SUPER_ADMIN): Get all demo requests
router.get('/', protect, authorizeRoles('SUPER_ADMIN'), getDemoRequests);

export default router;
