import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";

export interface ITestExecution extends Document {
  userId: Types.ObjectId;
  projectId: Types.ObjectId;
  testCycle: Types.ObjectId;
  testCaseResults: Types.ObjectId[];
  type: string;
  startDate: Date;
  endDate: Date;
}

const TestExecutionSchema = new Schema<ITestExecution>(
  {
    userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: DBModels.PROJECT,
      required: true,
    },
    testCycle: {
      type: Schema.Types.ObjectId,
      ref: DBModels.TEST_CYCLE,
      required: true,
    },
    testCaseResults: [
      { type: Schema.Types.ObjectId, ref: DBModels.TEST_CASE_RESULT },
    ],
    type: String,
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

export const TestExecution =
  mongoose.models.TestExecution ||
  model<ITestExecution>(DBModels.TEST_EXECUTION, TestExecutionSchema);
