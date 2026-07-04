import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { UserRole } from "@/types/auth";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  grade?: string;
  subject?: string;
  schoolName?: string;
  schoolCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: ["student", "teacher", "school", "admin"],
    },
    grade: { type: String, trim: true },
    subject: { type: String, trim: true },
    schoolName: { type: String, trim: true },
    schoolCode: { type: String, trim: true, uppercase: true },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1, role: 1 }, { unique: true });

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;
