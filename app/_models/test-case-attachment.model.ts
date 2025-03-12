import mongoose, { Schema, Document, model } from "mongoose";
import { DBModels } from "../_constants";

export interface ITestCaseAttachemnt extends Document {
  cloudId: string;
  name: string;
  contentType: string;
  testCaseId: string;
}

const TestCaseAttachmentSchema: Schema = new Schema(
  {
    cloudId: { type: String, unique: true },
    name: String,
    contentType: String,
    testCaseId: String,
  },
  { timestamps: true }
);

export const TestCaseAttachment =
  mongoose.models.TestCaseAttachment ||
  model<ITestCaseAttachemnt>(
    DBModels.TEST_CASE_ATTACHMENT,
    TestCaseAttachmentSchema
  );
