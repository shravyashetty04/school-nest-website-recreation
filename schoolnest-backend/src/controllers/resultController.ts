import { Response, NextFunction } from 'express';
import { Result } from '../models/Result';
import { AuthRequest } from '../middlewares/auth';
import { Teacher } from '../models/Teacher';

export const submitResult = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { studentId, examId, subjectId, marksObtained, maxMarks, grade, remarks } = req.body;
    
    let teacherId = req.user?._id;
    if (req.user?.role === 'TEACHER') {
      const teacher = await Teacher.findOne({ userId: req.user._id });
      if (teacher) teacherId = teacher._id;
    }

    const result = await Result.findOneAndUpdate(
      { studentId, examId, subjectId, schoolId: req.user?.schoolId },
      { teacherId, marksObtained, maxMarks, grade, remarks },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getResults = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query: any = { schoolId: req.user?.schoolId };
    
    if (req.query.studentId) query.studentId = req.query.studentId;
    if (req.query.examId) query.examId = req.query.examId;
    
    const results = await Result.find(query)
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('examId', 'examName')
      .populate('subjectId', 'subjectName');
      
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};
