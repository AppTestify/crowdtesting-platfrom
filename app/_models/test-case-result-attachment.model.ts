import mongoose, { Schema, Document, model } from "mongoose";
import { DBModels } from "../_constants";

export interface ITestCaseResultAttachemnt extends Document {
  cloudId: string;
  name: string;
  contentType: string;
  testCaseResultId: string;
}

const TestCaseResultAttachmentSchema: Schema = new Schema(
  {
    cloudId: { type: String, unique: true },
    name: String,
    contentType: String,
    testCaseResultId: String,
  },
  { timestamps: true }
);

export const TestCaseResultAttachment =
  mongoose.models.TestCaseResultAttachment ||
  model<ITestCaseResultAttachemnt>(
    DBModels.TEST_CASE_RESULT_ATTACHMENT,
    TestCaseResultAttachmentSchema
  );
