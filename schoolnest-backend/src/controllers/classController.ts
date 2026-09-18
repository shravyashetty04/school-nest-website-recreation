import { Request, Response, NextFunction } from 'express';
import { Class } from '../models/Class';
import { AuthRequest } from '../middlewares/auth';

export const createClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { className, grade, section, academicYear, classTeacher, roomNumber } = req.body;
    
    const newClass = await Class.create({
      className,
      grade,
      section,
      academicYear,
      classTeacher,
      roomNumber,
      schoolId: req.user?.schoolId,
    });
    
    res.status(201).json({ success: true, data: newClass });
  } catch (error) {
    next(error);
  }
};

export const getClasses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classes = await Class.find({ schoolId: req.user?.schoolId })
      .populate('classTeacher', 'firstName lastName')
      .populate('subjects', 'subjectName subjectCode');
      
    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    next(error);
  }
};

export const updateClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const updatedClass = await Class.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.user?.schoolId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedClass) {
      res.status(404);
      throw new Error('Class not found');
    }
    
    res.status(200).json({ success: true, data: updatedClass });
  } catch (error) {
    next(error);
  }
};

export const deleteClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const deletedClass = await Class.findOneAndDelete({ _id: req.params.id, schoolId: req.user?.schoolId });
    
    if (!deletedClass) {
      res.status(404);
      throw new Error('Class not found');
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
