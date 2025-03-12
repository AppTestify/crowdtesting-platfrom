import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";

export interface ITestCaseData extends Document {
  userId: Types.ObjectId;
  testCaseId: Types.ObjectId;
  name: string;
  type: string;
  validation: string[];
  inputValue: string;
  description: string;
  attachments: Types.ObjectId[];
}

const TestCaseDataSchema = new Schema<ITestCaseData>(
  {
    userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
    testCaseId: {
      type: Schema.Types.ObjectId,
      ref: DBModels.TEST_CASE,
      required: true,
    },
    name: { type: String, required: true },
    type: { type: String, required: true },
    validation: [{ type: String }],
    inputValue: { type: String, required: true },
    description: String,
    attachments: [
      { type: Schema.Types.ObjectId, ref: DBModels.TEST_CASE_DATA_ATTACHMENT },
    ],
  },
  {
    timestamps: true,
  }
);

export const TestCaseData =
  mongoose.models.TestCaseData ||
  model<ITestCaseData>(DBModels.TEST_CASE_DATA, TestCaseDataSchema);
