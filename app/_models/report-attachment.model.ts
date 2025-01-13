import mongoose, { Schema, Document, model } from "mongoose";
import { DBModels } from "../_constants";

export interface IReportAttachment extends Document {
  cloudId: string;
  name: string;
  contentType: string;
  reportId: string;
}

const ReportAttachmentSchema: Schema = new Schema(
  {
    cloudId: { type: String, unique: true },
    name: String,
    contentType: String,
    reportId: String,
  },
  { timestamps: true }
);

export const ReportAttachment =
  mongoose.models.ReportAttachment ||
  model<IReportAttachment>(
    DBModels.REPORT_ATTACHMENT,
    ReportAttachmentSchema
  );
