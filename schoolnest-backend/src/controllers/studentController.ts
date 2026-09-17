import { Response, NextFunction } from 'express';
import { Student } from '../models/Student';
import { AuthRequest } from '../middlewares/auth';
import { Class } from '../models/Class';

export const createStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const studentData = { ...req.body, schoolId: req.user?.schoolId };
    
    // Ensure studentId is generated if not provided
    if (!studentData.studentId) {
      studentData.studentId = `STU${Math.floor(Math.random() * 1000000)}`;
    }
    
    const student = await Student.create(studentData);
    
    if (studentData.classId) {
      await Class.findByIdAndUpdate(studentData.classId, { $push: { students: student._id } });
    }
    
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query: any = { schoolId: req.user?.schoolId };
    if (req.query.classId) query.classId = req.query.classId;
    if (req.query.status) query.status = req.query.status;
    
    const students = await Student.find(query)
      .populate('classId', 'className section')
      .populate('parentId', 'firstName lastName phone');
      
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, schoolId: req.user?.schoolId })
      .populate('classId', 'className section')
      .populate('parentId', 'firstName lastName phone email');
      
    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }
    
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const updatedStudent = await Student.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.user?.schoolId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedStudent) {
      res.status(404);
      throw new Error('Student not found');
    }
    
    res.status(200).json({ success: true, data: updatedStudent });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const deletedStudent = await Student.findOneAndDelete({ _id: req.params.id, schoolId: req.user?.schoolId });
    
    if (!deletedStudent) {
      res.status(404);
      throw new Error('Student not found');
    }
    
    if (deletedStudent.classId) {
      await Class.findByIdAndUpdate(deletedStudent.classId, { $pull: { students: deletedStudent._id } });
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
