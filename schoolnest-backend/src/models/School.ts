import mongoose, { Document, Schema } from 'mongoose';

export interface ISchool extends Document {
  schoolName: string;
  schoolCode: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  website?: string;
  logo?: string;
  principalName?: string;
  establishedYear?: number;
  academicYear: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSchema = new Schema<ISchool>(
  {
    schoolName: { type: String, required: true },
    schoolCode: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: String, required: true },
    website: { type: String },
    logo: { type: String },
    principalName: { type: String },
    establishedYear: { type: Number },
    academicYear: { type: String, required: true, default: '2023-2024' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const School = mongoose.model<ISchool>('School', SchoolSchema);
