import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";

export interface ITestCaseResult extends Document {
  userId: Types.ObjectId;
  testCycleId: Types.ObjectId;
  testCaseId: Types.ObjectId;
  testExecutionId: Types.ObjectId;
  remarks: string;
  result: string;
  // actualResult: string;
  attachments: Types.ObjectId[];
  updatedAt: Date;
  updatedBy: Types.ObjectId;
  isIssue: boolean;
  issueId: Types.ObjectId;
  testSteps: { index: number; status: string }[];
}

const TestCaseResultSchema = new Schema<ITestCaseResult>(
  {
    userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
    testCycleId: {
      type: Schema.Types.ObjectId,
      ref: DBModels.TEST_CYCLE,
      required: false,
    },
    testCaseId: {
      type: Schema.Types.ObjectId,
      ref: DBModels.TEST_CASE,
      required: true,
    },
    testExecutionId: {
      type: Schema.Types.ObjectId,
      ref: DBModels.TEST_EXECUTION,
    },
    remarks: { type: String, required: false },
    result: { type: String, required: false },
    // actualResult: { type: String, required: false },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: DBModels.TEST_CASE_RESULT_ATTACHMENT,
        required: false,
      },
    ],
    updatedAt: { type: Date, default: null },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: DBModels.USER,
      required: false,
    },
    isIssue: { type: Boolean, required: false },
    issueId: {
      type: Schema.Types.ObjectId,
      ref: DBModels.ISSUE,
      required: false,
    },
    testSteps: [
      {
        index: { type: Number },
        status: String,
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const TestCaseResult =
  mongoose.models.TestCaseResult ||
  model<ITestCaseResult>(DBModels.TEST_CASE_RESULT, TestCaseResultSchema);
