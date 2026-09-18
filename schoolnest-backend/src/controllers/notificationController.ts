import { Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middlewares/auth';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await Notification.find({ userId: req.user?._id }).sort('-createdAt');
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?._id },
      { isRead: true },
      { new: true }
    );
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};
