import mongoose, { Document, Schema } from 'mongoose';

export interface IResult extends Document {
  studentId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  teacherId?: mongoose.Types.ObjectId;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks?: string;
  schoolId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ResultSchema = new Schema<IResult>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    marksObtained: { type: Number, required: true },
    maxMarks: { type: Number, required: true, default: 100 },
    grade: { type: String, required: true },
    remarks: { type: String },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate results for the same exam and subject for a student
ResultSchema.index({ studentId: 1, examId: 1, subjectId: 1 }, { unique: true });

export const Result = mongoose.model<IResult>('Result', ResultSchema);
