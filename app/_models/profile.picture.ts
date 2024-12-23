import mongoose, { Schema, Document, model } from "mongoose";
import { DBModels } from "../_constants";

export interface IProfilePicture extends Document {
  cloudId: Buffer;
  name: string;
  contentType: string;
  userId: string;
}

const ProfilePictureSchema: Schema = new Schema(
  {
    cloudId: { type: String, unique: true },
    name: String,
    contentType: String,
    userId: String,
  },
  { timestamps: true }
);

export const ProfilePicture =
  mongoose.models.ProfilePicture ||
  model<IProfilePicture>(DBModels.PROFILE_PICTURE, ProfilePictureSchema);
