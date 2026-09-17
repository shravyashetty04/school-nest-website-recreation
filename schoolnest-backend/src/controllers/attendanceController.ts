import { Response, NextFunction } from 'express';
import { Attendance } from '../models/Attendance';
import { AuthRequest } from '../middlewares/auth';
import { Teacher } from '../models/Teacher';
import { Student } from '../models/Student';

export const markAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { studentId, classId, date, status, remarks } = req.body;
    
    // In a real app, verify the teacher is assigned to this class
    let teacherId = req.user?._id;
    if (req.user?.role === 'TEACHER') {
      const teacher = await Teacher.findOne({ userId: req.user._id });
      if (teacher) teacherId = teacher._id;
    }

    // Set time to beginning of day to avoid time component issues
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      { studentId, classId, date: attendanceDate, schoolId: req.user?.schoolId },
      { status, remarks, teacherId },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

export const getAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query: any = { schoolId: req.user?.schoolId };
    
    if (req.query.classId) query.classId = req.query.classId;
    if (req.user?.role === 'STUDENT') {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) {
        query.studentId = student._id;
      } else {
        return res.status(200).json({ success: true, data: [] });
      }
    } else if (req.query.studentId) {
      query.studentId = req.query.studentId;
    }
    if (req.query.date) {
      const d = new Date(req.query.date as string);
      d.setHours(0,0,0,0);
      query.date = d;
    }
    
    const records = await Attendance.find(query)
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('classId', 'className section');
      
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};
