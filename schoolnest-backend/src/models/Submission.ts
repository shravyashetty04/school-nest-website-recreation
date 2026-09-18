import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmission extends Document {
  assignmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  attachment?: string;
  status: 'SUBMITTED' | 'LATE' | 'GRADED';
  marksObtained?: number;
  feedback?: string;
  schoolId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    attachment: { type: String },
    status: {
      type: String,
      enum: ['SUBMITTED', 'LATE', 'GRADED'],
      default: 'SUBMITTED',
    },
    marksObtained: { type: Number },
    feedback: { type: String },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
  },
  {
    timestamps: true,
  }
);

SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
