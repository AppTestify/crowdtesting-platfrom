import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";

export interface IMail extends Document {
  userId: Types.ObjectId;
  emails: string[];
  subject: string;
  body: string;
}

const MailSchema = new Schema<IMail>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DBModels.USER,
      required: true,
    },
    emails: [
      {
        type: String,
        required: true,
      },
    ],
    subject: {
      type: String,
      required: true,
    },
    body: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const Mail =
  mongoose.models.Mail || model<IMail>(DBModels.MAIL, MailSchema);
