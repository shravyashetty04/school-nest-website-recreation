import { FeeInvoice, IFeeInvoice } from '../models/FeeInvoice';

export const getInvoices = async () => {
  return await FeeInvoice.find({}).populate('studentId', 'firstName lastName admissionNumber');
};
