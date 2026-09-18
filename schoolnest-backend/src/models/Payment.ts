import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  paymentId: string;
  studentId: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  feeId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'ONLINE';
  transactionId?: string;
  paymentDate: Date;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentId: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Parent' },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    feeId: { type: Schema.Types.ObjectId, ref: 'Fee', required: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'ONLINE'],
      required: true,
    },
    transactionId: { type: String },
    paymentDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING'],
      default: 'SUCCESS',
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
