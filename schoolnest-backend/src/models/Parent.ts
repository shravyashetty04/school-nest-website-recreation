import mongoose, { Document, Schema } from 'mongoose';

export interface IParent extends Document {
  parentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  occupation?: string;
  address?: string;
  schoolId: mongoose.Types.ObjectId;
  children: mongoose.Types.ObjectId[];
  userId: mongoose.Types.ObjectId; // Reference to auth user
  createdAt: Date;
  updatedAt: Date;
}

const ParentSchema = new Schema<IParent>(
  {
    parentId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String },
    occupation: { type: String },
    address: { type: String },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    children: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

export const Parent = mongoose.model<IParent>('Parent', ParentSchema);
