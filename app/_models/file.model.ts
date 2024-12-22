import mongoose, { Schema, Document, Types, model } from "mongoose";
import { DBModels } from "../_constants";

export interface IFile extends Document {
  name: string;
  contentType: string;
  cloudId: string;
  fileType: string;
  userId: Types.ObjectId;
  isVerify: boolean;
  verifyBy?: Types.ObjectId;
}

const FileSchema: Schema = new Schema(
  {
    name: String,
    fileType: String,
    contentType: String,
    cloudId: { type: String, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: DBModels.USER },
    isVerify: Boolean,
    verifyBy: { type: Schema.Types.ObjectId, ref: DBModels.USER },
  },
  { timestamps: true }
);

export const File =
  mongoose.models.File || model<IFile>(DBModels.FILE, FileSchema);
