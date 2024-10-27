import mongoose, { Document, Schema, model } from "mongoose";
import { DBModels } from "../_constants";

export interface IBrowser extends Document {
  name: string;
  logo: Buffer;
  version: string;
}

const browserSchema = new Schema<IBrowser>(
  {
    name: { type: String, required: true },
    logo: { type: Buffer, required: true },
    version: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

export const Browser =
  mongoose.models.Browser || model<IBrowser>(DBModels.BROWSER, browserSchema);
