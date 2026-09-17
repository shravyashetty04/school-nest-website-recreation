import { Response, NextFunction } from 'express';
import { Fee } from '../models/Fee';
import { Payment } from '../models/Payment';
import { AuthRequest } from '../middlewares/auth';

export const createFee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const feeData = { ...req.body, schoolId: req.user?.schoolId, balance: req.body.amount };
    const fee = await Fee.create(feeData);
    res.status(201).json({ success: true, data: fee });
  } catch (error) {
    next(error);
  }
};

export const getFees = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query: any = { schoolId: req.user?.schoolId };
    
    if (req.query.studentId) query.studentId = req.query.studentId;
    if (req.query.status) query.status = req.query.status;
    
    const fees = await Fee.find(query)
      .populate('studentId', 'firstName lastName admissionNumber');
      
    res.status(200).json({ success: true, data: fees });
  } catch (error) {
    next(error);
  }
};

export const processPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { feeId, amount, paymentMethod, transactionId } = req.body;
    
    const fee = await Fee.findOne({ _id: feeId, schoolId: req.user?.schoolId });
    if (!fee) {
      res.status(404);
      throw new Error('Fee not found');
    }

    if (amount > fee.balance) {
      res.status(400);
      throw new Error('Payment amount cannot exceed remaining balance');
    }

    const paymentId = `PAY${Math.floor(Math.random() * 1000000)}`;

    const payment = await Payment.create({
      paymentId,
      studentId: fee.studentId,
      schoolId: req.user?.schoolId,
      feeId: fee._id,
      amount,
      paymentMethod,
      transactionId,
    });

    // Update fee record
    fee.amountPaid += amount;
    // The pre-save hook on Fee model will recalculate balance and status
    await fee.save();

    res.status(201).json({ success: true, data: payment, fee });
  } catch (error) {
    next(error);
  }
};

export const getPayments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query: any = { schoolId: req.user?.schoolId };
    if (req.query.studentId) query.studentId = req.query.studentId;
    
    const payments = await Payment.find(query)
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('feeId', 'feeType');
      
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};
