import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  description: string;
  subjectId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  dueDate: Date;
  attachment?: string;
  schoolId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    dueDate: { type: Date, required: true },
    attachment: { type: String },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
  },
  {
    timestamps: true,
  }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
