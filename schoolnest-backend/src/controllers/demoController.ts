import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as demoService from '../services/demoService';

const demoRequestSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  workEmail: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  schoolName: z.string().min(1, 'School name is required'),
  studentCapacity: z.enum(['<500', '500-2000', '2000+']),
});

export const requestDemo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = demoRequestSchema.parse(req.body);
    const demo = await demoService.createDemoRequest(validatedData);
    res.status(201).json({ success: true, message: 'Demo request submitted successfully', data: demo });
  } catch (error) {
    next(error);
  }
};

export const getDemoRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const demos = await demoService.getDemoRequests();
    res.status(200).json({ success: true, data: demos });
  } catch (error) {
    next(error);
  }
};
