import mongoose, { Schema, Document, model } from "mongoose";
import { DBModels } from "../_constants";

export interface IFile extends Document {
  data: Buffer;
  name: string;
  contentType: string;
  fileType: string;
  userId: string;
}

const FileSchema: Schema = new Schema(
  {
    data: Buffer,
    name: String,
    contentType: String,
    fileType: String,
    userId: String,
  },
  { timestamps: true }
);

export const File =
  mongoose.models.File || model<IFile>(DBModels.FILE, FileSchema);
