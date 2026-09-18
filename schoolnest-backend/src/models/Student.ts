import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  studentId: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: string;
  email?: string;
  phone?: string;
  profilePhoto?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  parentId?: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  classId?: mongoose.Types.ObjectId;
  section?: string;
  rollNumber?: string;
  admissionDate?: Date;
  academicYear?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'GRADUATED';
  userId?: mongoose.Types.ObjectId; // Optional ref to auth user if they can login
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    studentId: { type: String, required: true, unique: true },
    admissionNumber: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String },
    email: { type: String },
    phone: { type: String },
    profilePhoto: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    bloodGroup: { type: String },
    emergencyContact: { type: String },
    parentId: { type: Schema.Types.ObjectId, ref: 'Parent' },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class' },
    section: { type: String },
    rollNumber: { type: String },
    admissionDate: { type: Date },
    academicYear: { type: String },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'TRANSFERRED', 'GRADUATED'],
      default: 'ACTIVE',
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

export const Student = mongoose.model<IStudent>('Student', studentSchema);
