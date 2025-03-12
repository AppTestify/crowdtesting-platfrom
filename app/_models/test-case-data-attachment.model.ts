import mongoose, { Schema, Document, model } from "mongoose";
import { DBModels } from "../_constants";

export interface ITestCaseDataAttachemnt extends Document {
  cloudId: string;
  name: string;
  contentType: string;
  testCaseDataId: string;
}

const TestCaseDataAttachmentSchema: Schema = new Schema(
  {
    cloudId: { type: String, unique: true },
    name: String,
    contentType: String,
    testCaseDataId: String,
  },
  { timestamps: true }
);

export const TestCaseDataAttachment =
  mongoose.models.TestCaseDataAttachment ||
  model<ITestCaseDataAttachemnt>(
    DBModels.TEST_CASE_DATA_ATTACHMENT,
    TestCaseDataAttachmentSchema
  );
