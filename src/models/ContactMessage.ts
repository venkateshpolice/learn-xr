import mongoose, { Schema, type Document, type Model } from "mongoose";

export type ContactSubject =
  | "general"
  | "schools"
  | "support"
  | "partnership"
  | "feedback";

export interface IContactMessage extends Document {
  name: string;
  email: string;
  phone: string;
  role?: string;
  subject: ContactSubject;
  message: string;
  createdAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    subject: {
      type: String,
      required: true,
      enum: ["general", "schools", "support", "partnership", "feedback"],
    },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const ContactMessage: Model<IContactMessage> =
  mongoose.models.ContactMessage ??
  mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);

export default ContactMessage;
