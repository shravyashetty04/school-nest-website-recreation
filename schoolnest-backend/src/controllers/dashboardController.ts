import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { Student } from '../models/Student';
import { Teacher } from '../models/Teacher';
import { Class } from '../models/Class';
import { Fee } from '../models/Fee';
import { Attendance } from '../models/Attendance';
import { Announcement } from '../models/Announcement';

export const getAdminDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    
    // Aggregate data
    const totalStudents = await Student.countDocuments({ schoolId, status: 'ACTIVE' });
    const totalTeachers = await Teacher.countDocuments({ schoolId, status: 'ACTIVE' });
    const totalClasses = await Class.countDocuments({ schoolId });
    
    // Revenue calculations (Basic)
    const fees = await Fee.find({ schoolId });
    const totalRevenue = fees.reduce((acc, fee) => acc + fee.amountPaid, 0);
    const totalPending = fees.reduce((acc, fee) => acc + fee.balance, 0);
    
    // Today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const presentStudents = await Attendance.countDocuments({ schoolId, date: today, status: 'PRESENT' });
    const absentStudents = await Attendance.countDocuments({ schoolId, date: today, status: 'ABSENT' });
    
    // Recent announcements
    const recentAnnouncements = await Announcement.find({ schoolId }).sort('-createdAt').limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalTeachers,
          totalClasses,
          revenue: { totalRevenue, totalPending },
          attendance: { presentStudents, absentStudents }
        },
        recentAnnouncements
      }
    });
  } catch (error) {
    next(error);
  }
};
