import mongoose, { Document, Schema } from 'mongoose';

export interface IClass extends Document {
  className: string;
  grade: string;
  section: string;
  academicYear: string;
  classTeacher?: mongoose.Types.ObjectId;
  roomNumber?: string;
  schoolId: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  subjects: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema = new Schema<IClass>(
  {
    className: { type: String, required: true },
    grade: { type: String, required: true },
    section: { type: String, required: true },
    academicYear: { type: String, required: true },
    classTeacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    roomNumber: { type: String },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
  },
  {
    timestamps: true,
  }
);

export const Class = mongoose.model<IClass>('Class', ClassSchema);
