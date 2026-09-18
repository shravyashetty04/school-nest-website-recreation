import mongoose, { Document, Schema } from 'mongoose';

export interface IDemoRequest extends Document {
  fullName: string;
  workEmail: string;
  phone: string;
  schoolName: string;
  studentCapacity: '<500' | '500-2000' | '2000+';
  status: 'PENDING' | 'CONTACTED' | 'SCHEDULED' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
}

const demoRequestSchema = new Schema<IDemoRequest>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    workEmail: {
      type: String,
      required: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
    },
    phone: {
      type: String,
      required: true,
    },
    schoolName: {
      type: String,
      required: true,
    },
    studentCapacity: {
      type: String,
      enum: ['<500', '500-2000', '2000+'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONTACTED', 'SCHEDULED', 'CLOSED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

export const DemoRequest = mongoose.model<IDemoRequest>('DemoRequest', demoRequestSchema);
