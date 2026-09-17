import express from 'express';
import { createFee, getFees, processPayment, getPayments } from '../controllers/feeController';
import { protect, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), createFee)
  .get(getFees);

router
  .route('/payments')
  .post(authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PARENT', 'STUDENT'), processPayment)
  .get(getPayments);

export default router;
