import mongoose, { Document, Schema } from 'mongoose';

export interface ITimetable extends Document {
  classId: mongoose.Types.ObjectId;
  section: string;
  subjectId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  roomNumber?: string;
  schoolId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TimetableSchema = new Schema<ITimetable>(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: String, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    roomNumber: { type: String },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
  },
  {
    timestamps: true,
  }
);

// Prevent timetable conflicts (teacher can't be in two places at once)
TimetableSchema.index({ teacherId: 1, day: 1, startTime: 1 }, { unique: true });
// Prevent timetable conflicts (class can't have two subjects at once)
TimetableSchema.index({ classId: 1, day: 1, startTime: 1 }, { unique: true });

export const Timetable = mongoose.model<ITimetable>('Timetable', TimetableSchema);
