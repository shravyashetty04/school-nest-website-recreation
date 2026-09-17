import mongoose, { Document, Schema } from 'mongoose';

export interface ISubject extends Document {
  subjectName: string;
  subjectCode: string;
  description?: string;
  teacherId?: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  maxMarks: number;
  passingMarks: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    subjectName: { type: String, required: true },
    subjectCode: { type: String, required: true },
    description: { type: String },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    maxMarks: { type: Number, required: true, default: 100 },
    passingMarks: { type: Number, required: true, default: 40 },
  },
  {
    timestamps: true,
  }
);

export const Subject = mongoose.model<ISubject>('Subject', SubjectSchema);
