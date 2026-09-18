import { Response, NextFunction } from 'express';
import { Assignment } from '../models/Assignment';
import { Submission } from '../models/Submission';
import { AuthRequest } from '../middlewares/auth';
import { Teacher } from '../models/Teacher';

export const createAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const assignmentData = { ...req.body, schoolId: req.user?.schoolId };
    
    if (req.user?.role === 'TEACHER' && !assignmentData.teacherId) {
      const teacher = await Teacher.findOne({ userId: req.user._id });
      if (teacher) assignmentData.teacherId = teacher._id;
    }

    const assignment = await Assignment.create(assignmentData);
    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

export const getAssignments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query: any = { schoolId: req.user?.schoolId };
    if (req.query.classId) query.classId = req.query.classId;
    if (req.query.subjectId) query.subjectId = req.query.subjectId;
    
    const assignments = await Assignment.find(query)
      .populate('classId', 'className section')
      .populate('subjectId', 'subjectName')
      .populate('teacherId', 'firstName lastName');
      
    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, schoolId: req.user?.schoolId });
    if (!assignment) {
      res.status(404);
      throw new Error('Assignment not found');
    }
    await Submission.deleteMany({ assignmentId: assignment._id });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const submitAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { assignmentId, studentId, attachment } = req.body;
    
    const submission = await Submission.findOneAndUpdate(
      { assignmentId, studentId, schoolId: req.user?.schoolId },
      { attachment, status: 'SUBMITTED' },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};
