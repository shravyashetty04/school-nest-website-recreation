import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  audience: 'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'SPECIFIC_CLASS';
  classId?: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    audience: {
      type: String,
      enum: ['ALL', 'TEACHERS', 'STUDENTS', 'PARENTS', 'SPECIFIC_CLASS'],
      required: true,
    },
    classId: { type: Schema.Types.ObjectId, ref: 'Class' },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
  },
  {
    timestamps: true,
  }
);

export const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
