import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";
import { Counter } from "./counter.model";

export interface ITestExecution extends Document {
  userId: Types.ObjectId;
  projectId: Types.ObjectId;
  testCycle: Types.ObjectId;
  testCaseResults: Types.ObjectId[];
  type: string;
  startDate: Date;
  endDate: Date;
  customId: number;
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
    customId: { type: Number },
  },
  {
    timestamps: true,
  }
);

TestExecutionSchema.pre("save", async function (next) {
  const testExecution = this;

  if (testExecution.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { entity: DBModels.TEST_EXECUTION, projectId: testExecution.projectId },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true }
      );

      testExecution.customId = counter.sequence;
      next();
    } catch (err: any) {
      next(err);
    }
  } else {
    next();
  }
});

export const TestExecution =
  mongoose.models.TestExecution ||
  model<ITestExecution>(DBModels.TEST_EXECUTION, TestExecutionSchema);
