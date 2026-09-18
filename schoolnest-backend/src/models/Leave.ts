import mongoose, { Document, Schema } from 'mongoose';

export interface ILeave extends Document {
  userId: mongoose.Types.ObjectId;
  role: 'TEACHER' | 'STUDENT';
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema = new Schema<ILeave>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['TEACHER', 'STUDENT'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
  },
  {
    timestamps: true,
  }
);

export const Leave = mongoose.model<ILeave>('Leave', LeaveSchema);
