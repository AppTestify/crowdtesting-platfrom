import mongoose, { Schema, Document, model } from "mongoose";
import { DBModels } from "../_constants";

export interface ITestCycleAttachemnt extends Document {
  cloudId: string;
  name: string;
  contentType: string;
  testCycleId: string;
}

const TestCycleAttachmentSchema: Schema = new Schema(
  {
    cloudId: { type: String, unique: true },
    name: String,
    contentType: String,
    testCycleId: String,
  },
  { timestamps: true }
);

export const TestCycleAttachment =
  mongoose.models.TestCycleAttachment ||
  model<ITestCycleAttachemnt>(
    DBModels.TEST_CYCLE_ATTACHMENT,
    TestCycleAttachmentSchema
  );
