import { Request, Response, NextFunction } from 'express';
import { Subject } from '../models/Subject';
import { AuthRequest } from '../middlewares/auth';
import { Class } from '../models/Class';

export const createSubject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subjectName, subjectCode, description, teacherId, classId, maxMarks, passingMarks } = req.body;
    
    const subject = await Subject.create({
      subjectName,
      subjectCode,
      description,
      teacherId,
      classId,
      schoolId: req.user?.schoolId,
      maxMarks,
      passingMarks,
    });
    
    if (classId) {
      await Class.findByIdAndUpdate(classId, { $push: { subjects: subject._id } });
    }
    
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

export const getSubjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query: any = { schoolId: req.user?.schoolId };
    if (req.query.classId) {
      query.classId = req.query.classId;
    }
    
    const subjects = await Subject.find(query)
      .populate('teacherId', 'firstName lastName')
      .populate('classId', 'className section');
      
    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const updatedSubject = await Subject.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.user?.schoolId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedSubject) {
      res.status(404);
      throw new Error('Subject not found');
    }
    
    res.status(200).json({ success: true, data: updatedSubject });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const deletedSubject = await Subject.findOneAndDelete({ _id: req.params.id, schoolId: req.user?.schoolId });
    
    if (!deletedSubject) {
      res.status(404);
      throw new Error('Subject not found');
    }
    
    if (deletedSubject.classId) {
       await Class.findByIdAndUpdate(deletedSubject.classId, { $pull: { subjects: deletedSubject._id } });
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
