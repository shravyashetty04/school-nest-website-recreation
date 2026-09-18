import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router.route('/').get(getNotifications);
router.route('/:id/read').put(markAsRead);

export default router;
