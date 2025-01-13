import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";

export interface IReport extends Document {
  title: string;
  description: string;
  userId: Types.ObjectId;
  projectId: Types.ObjectId;
  attachments: Types.ObjectId[];
}

const ReportsSchema = new Schema<IReport>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: DBModels.PROJECT,
      required: true,
    },
    attachments: [
      { type: Schema.Types.ObjectId, ref: DBModels.REPORT_ATTACHMENT },
    ],
  },
  {
    timestamps: true,
  }
);

export const Report =
  mongoose.models.Report || model<IReport>(DBModels.REPORT, ReportsSchema);
