import mongoose, { Document, Schema } from 'mongoose';

export interface IFee extends Document {
  studentId: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  academicYear: string;
  feeType: string;
  amount: number;
  dueDate: Date;
  amountPaid: number;
  balance: number;
  status: 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';
  createdAt: Date;
  updatedAt: Date;
}

const FeeSchema = new Schema<IFee>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    academicYear: { type: String, required: true },
    feeType: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    amountPaid: { type: Number, default: 0 },
    balance: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PAID', 'PARTIAL', 'PENDING', 'OVERDUE'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate balance and status automatically
FeeSchema.pre('save', function (next) {
  this.balance = this.amount - this.amountPaid;
  if (this.balance <= 0) {
    this.status = 'PAID';
  } else if (this.amountPaid > 0) {
    this.status = 'PARTIAL';
  } else if (this.dueDate < new Date()) {
    this.status = 'OVERDUE';
  } else {
    this.status = 'PENDING';
  }
  next();
});

export const Fee = mongoose.model<IFee>('Fee', FeeSchema);
