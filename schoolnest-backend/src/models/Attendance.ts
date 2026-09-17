import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  date: Date;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'LEAVE'],
      required: true,
    },
    remarks: { type: String },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance for the same student/date/class
AttendanceSchema.index({ studentId: 1, date: 1, classId: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
