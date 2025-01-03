import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";

export interface IWebsite extends Document {
  websiteName: string;
  timeZone: string;
  userId: Types.ObjectId;
  logo: {
    cloudId: string;
    name: String;
    contentType: String;
  };
  emails: [string];
}

const WebsiteSchema = new Schema<IWebsite>(
  {
    websiteName: { type: String, required: false },
    timeZone: { type: String, required: false },
    userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
    logo: {
      cloudId: { type: String, unique: true },
      name: { type: String },
      contentType: { type: String },
    },
    emails: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export const Website =
  mongoose.models.Website || model<IWebsite>(DBModels.WEBSITE, WebsiteSchema);
