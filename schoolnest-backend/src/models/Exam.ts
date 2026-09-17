import mongoose, { Document, Schema } from 'mongoose';

export interface IExam extends Document {
  examName: string;
  academicYear: string;
  startDate: Date;
  endDate: Date;
  classes: mongoose.Types.ObjectId[];
  subjects: mongoose.Types.ObjectId[];
  schoolId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema<IExam>(
  {
    examName: { type: String, required: true },
    academicYear: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    classes: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
  },
  {
    timestamps: true,
  }
);

export const Exam = mongoose.model<IExam>('Exam', ExamSchema);
