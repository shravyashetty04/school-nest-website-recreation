import { Response, NextFunction } from 'express';
import { Teacher } from '../models/Teacher';
import { AuthRequest } from '../middlewares/auth';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

export const createTeacher = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, firstName, lastName, ...otherData } = req.body;
    const schoolId = req.user?.schoolId;

    // Create auth user for teacher
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('teacher123', salt); // Default password
    
    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      passwordHash: hashedPassword,
      role: 'TEACHER',
      schoolId,
    });

    const teacherData = { 
      ...otherData, 
      email, 
      firstName, 
      lastName, 
      schoolId,
      userId: user._id
    };
    
    if (!teacherData.teacherId) teacherData.teacherId = `TCH${Math.floor(Math.random() * 100000)}`;
    if (!teacherData.employeeId) teacherData.employeeId = `EMP${Math.floor(Math.random() * 100000)}`;
    
    const teacher = await Teacher.create(teacherData);
    
    res.status(201).json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
};

export const getTeachers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const teachers = await Teacher.find({ schoolId: req.user?.schoolId })
      .populate('assignedSubjects', 'subjectName')
      .populate('assignedClasses', 'className section');
      
    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    next(error);
  }
};

export const updateTeacher = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const updatedTeacher = await Teacher.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.user?.schoolId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedTeacher) {
      res.status(404);
      throw new Error('Teacher not found');
    }
    
    res.status(200).json({ success: true, data: updatedTeacher });
  } catch (error) {
    next(error);
  }
};

export const deleteTeacher = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const deletedTeacher = await Teacher.findOneAndDelete({ _id: req.params.id, schoolId: req.user?.schoolId });
    
    if (!deletedTeacher) {
      res.status(404);
      throw new Error('Teacher not found');
    }
    
    // Also delete user
    await User.findByIdAndDelete(deletedTeacher.userId);
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
