import mongoose, { Document, Types, Schema, model } from "mongoose";
import { DBModels } from "../_constants";

export interface IDevice extends Document {
  name: string;
  os: string;
  version: string;
  browsers: Types.ObjectId[];
  country: string;
  city: string;
  network: string;
  userId: Types.ObjectId;
}

const DeviceSchema = new Schema<IDevice>(
  {
    name: { type: String, required: true },
    os: { type: String, required: true },
    version: { type: String, required: false },
    browsers: [
      { type: Schema.Types.ObjectId, ref: DBModels.BROWSER, required: true },
    ],
    country: { type: String, required: false },
    city: { type: String, required: false },
    network: { type: String, required: false },
    userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
  },
  {
    timestamps: true,
  }
);

export const Device =
  mongoose.models.Device || model<IDevice>(DBModels.DEVICE, DeviceSchema);
