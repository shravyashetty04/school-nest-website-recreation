import { Response, NextFunction } from 'express';
import { Timetable } from '../models/Timetable';
import { AuthRequest } from '../middlewares/auth';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

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

export const bulkCreateTimetable = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a CSV file');
    }

    const schoolId = req.user?.schoolId;
    const results: any[] = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const insertedRecords = [];
          for (const row of results) {
            const { classId, section, subjectId, teacherId, day, startTime, endTime, roomNumber } = row;
            if (!classId || !subjectId || !teacherId || !day || !startTime || !endTime) continue;

            const entry = await Timetable.create({
              classId, section, subjectId, teacherId, day, startTime, endTime, roomNumber, schoolId
            });
            insertedRecords.push(entry);
          }
          res.status(201).json({ success: true, count: insertedRecords.length });
        } catch (error) {
          next(error);
        }
      });
  } catch (error) {
    next(error);
  }
};
