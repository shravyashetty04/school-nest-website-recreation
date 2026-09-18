import { Response, NextFunction } from 'express';
import { Leave } from '../models/Leave';
import { Attendance } from '../models/Attendance';
import { Student } from '../models/Student';
import { AuthRequest } from '../middlewares/auth';

export const applyForLeave = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const leave = await Leave.create({
      ...req.body,
      userId: req.user?._id,
      role: req.user?.role,
      schoolId: req.user?.schoolId,
    });
    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

export const getLeaves = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query: any = { schoolId: req.user?.schoolId };
    
    // If not admin, they can only see their own leaves
    if (!['SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(req.user?.role as string)) {
      query.userId = req.user?._id;
    } else if (req.query.userId) {
      // Admin searching for a specific user
      query.userId = req.query.userId;
    }
    
    const leaves = await Leave.find(query).populate('userId', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const leave = await Leave.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.user?.schoolId },
      { status: req.body.status, approvedBy: req.user?._id },
      { new: true, runValidators: true }
    );
    if (!leave) {
      res.status(404);
      throw new Error('Leave request not found');
    }

    // Automate Attendance marking if approved
    if (leave.status === 'APPROVED' && leave.role === 'STUDENT') {
      const student = await Student.findOne({ userId: leave.userId });
      if (student && student.classId) {
        let currentDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        
        while (currentDate <= endDate) {
          // Skip weekends (0 is Sunday, 6 is Saturday)
          if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
            const attendanceDate = new Date(currentDate);
            attendanceDate.setHours(0, 0, 0, 0);

            await Attendance.findOneAndUpdate(
              { 
                studentId: student._id, 
                classId: student.classId, 
                date: attendanceDate, 
                schoolId: req.user?.schoolId 
              },
              { 
                status: 'LEAVE', 
                remarks: 'Approved Leave',
                teacherId: req.user?._id // Use admin's ID as the marker for this automated record
              },
              { new: true, upsert: true, runValidators: true }
            );
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};
