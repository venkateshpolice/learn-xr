import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { ARScapeObject, ARScapeStatus } from "@/types/arscape";

export interface IARScape extends Document {
  teacherId: string;
  title: string;
  description?: string;
  objects: ARScapeObject[];
  arPrimaryObjectId?: string;
  status: ARScapeStatus;
  slug?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ARScapeObjectSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    modelUrl: { type: String, required: true },
    usdzUrl: String,
    thumbnailUrl: String,
    source: { type: String, enum: ["builtin", "sketchfab", "upload"], required: true },
    sketchfabUid: String,
    position: { type: [Number], default: [0, 0, 0] },
    rotation: { type: [Number], default: [0, 0, 0] },
    scale: { type: [Number], default: [1, 1, 1] },
  },
  { _id: false },
);

const ARScapeSchema = new Schema<IARScape>(
  {
    teacherId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, default: "Untitled ARScape" },
    description: { type: String, trim: true },
    objects: { type: [ARScapeObjectSchema], default: [] },
    arPrimaryObjectId: String,
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    slug: { type: String, unique: true, sparse: true },
    publishedAt: Date,
  },
  { timestamps: true },
);

ARScapeSchema.index({ teacherId: 1, updatedAt: -1 });

const ARScape: Model<IARScape> =
  mongoose.models.ARScape ?? mongoose.model<IARScape>("ARScape", ARScapeSchema);

export default ARScape;
