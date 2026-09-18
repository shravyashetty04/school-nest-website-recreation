import { Response, NextFunction } from 'express';
import { Announcement } from '../models/Announcement';
import { AuthRequest } from '../middlewares/auth';

export const createAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      createdBy: req.user?._id,
      schoolId: req.user?.schoolId,
    });
    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    next(error);
  }
};

export const getAnnouncements = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query: any = { schoolId: req.user?.schoolId };
    
    // Add logic to filter by audience depending on the user's role
    // For now we will return all if admin, else we would filter
    const role = req.user?.role;
    if (role === 'TEACHER') query.audience = { $in: ['ALL', 'TEACHERS'] };
    if (role === 'STUDENT') query.audience = { $in: ['ALL', 'STUDENTS'] };
    if (role === 'PARENT') query.audience = { $in: ['ALL', 'PARENTS'] };
    
    const announcements = await Announcement.find(query).sort('-createdAt');
    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    next(error);
  }
};
