import { Response, NextFunction } from 'express';
import { Exam } from '../models/Exam';
import { AuthRequest } from '../middlewares/auth';

export const createExam = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const examData = { ...req.body, schoolId: req.user?.schoolId };
    const exam = await Exam.create(examData);
    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
};

export const getExams = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const exams = await Exam.find({ schoolId: req.user?.schoolId })
      .populate('classes', 'className section')
      .populate('subjects', 'subjectName');
    res.status(200).json({ success: true, data: exams });
  } catch (error) {
    next(error);
  }
};

export const updateExam = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.user?.schoolId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!exam) {
      res.status(404);
      throw new Error('Exam not found');
    }
    res.status(200).json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
};

export const deleteExam = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, schoolId: req.user?.schoolId });
    if (!exam) {
      res.status(404);
      throw new Error('Exam not found');
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
