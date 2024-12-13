import mongoose, { Schema, Document, Types, model } from "mongoose";
import { DBModels } from "../_constants";

export interface IFile extends Document {
  data: Buffer;
  name: string;
  contentType: string;
  fileType: string;
  userId: Types.ObjectId;
  isVerify: boolean;
  verifyBy: string;
}

const FileSchema: Schema = new Schema(
  {
    data: Buffer,
    name: String,
    contentType: String,
    fileType: String,
    userId: { type: Schema.Types.ObjectId, ref: DBModels.USER },
    isVerify: Boolean,
    verifyBy: String
  },
  { timestamps: true }
);

export const File =
  mongoose.models.File || model<IFile>(DBModels.FILE, FileSchema);
