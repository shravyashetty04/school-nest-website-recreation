import { Response, NextFunction } from 'express';
import { Timetable } from '../models/Timetable';
import { AuthRequest } from '../middlewares/auth';

export const createTimetable = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const timetableData = { ...req.body, schoolId: req.user?.schoolId };
    const entry = await Timetable.create(timetableData);
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

export const getTimetable = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query: any = { schoolId: req.user?.schoolId };
    
    if (req.query.classId) query.classId = req.query.classId;
    if (req.query.teacherId) query.teacherId = req.query.teacherId;
    if (req.query.day) query.day = req.query.day;
    
    const records = await Timetable.find(query)
      .populate('classId', 'className section')
      .populate('subjectId', 'subjectName subjectCode')
      .populate('teacherId', 'firstName lastName')
      .sort('startTime');
      
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

export const deleteTimetable = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const entry = await Timetable.findOneAndDelete({ _id: req.params.id, schoolId: req.user?.schoolId });
    if (!entry) {
      res.status(404);
      throw new Error('Timetable entry not found');
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
