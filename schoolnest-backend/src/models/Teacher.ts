import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacher extends Document {
  teacherId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender?: string;
  dateOfBirth?: Date;
  qualification?: string;
  specialization?: string;
  experience?: number;
  joiningDate?: Date;
  profilePhoto?: string;
  address?: string;
  schoolId: mongoose.Types.ObjectId;
  assignedSubjects: mongoose.Types.ObjectId[];
  assignedClasses: mongoose.Types.ObjectId[];
  status: 'ACTIVE' | 'INACTIVE';
  userId: mongoose.Types.ObjectId; // Reference to auth user
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    teacherId: { type: String, required: true, unique: true },
    employeeId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    gender: { type: String },
    dateOfBirth: { type: Date },
    qualification: { type: String },
    specialization: { type: String },
    experience: { type: Number },
    joiningDate: { type: Date },
    profilePhoto: { type: String },
    address: { type: String },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    assignedSubjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
    assignedClasses: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

export const Teacher = mongoose.model<ITeacher>('Teacher', TeacherSchema);
