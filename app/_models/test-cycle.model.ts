import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";
import { Counter } from "./counter.model";

export interface ITestCycle extends Document {
  title: string;
  userId: Types.ObjectId;
  projectId: Types.ObjectId;
  customId: number;
  description: string;
  testCaseResults?: [Types.ObjectId];
  startDate: Date;
  endDate: Date;
}

const TestCycleSchema = new Schema<ITestCycle>(
  {
    title: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: DBModels.PROJECT,
      required: true,
    },
    customId: { type: Number },
    description: { type: String, required: true },
    testCaseResults: [
      { type: Schema.Types.ObjectId, ref: DBModels.TEST_CASE_RESULT },
    ],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

TestCycleSchema.pre("save", async function (next) {
  const testCase = this;
  if (testCase.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { entity: DBModels.TEST_CYCLE, projectId: testCase.projectId },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true }
      );

      testCase.customId = counter.sequence;
      next();
    } catch (err: any) {
      next(err);
    }
  } else {
    next();
  }
});

export const TestCycle =
  mongoose.models.TestCycle ||
  model<ITestCycle>(DBModels.TEST_CYCLE, TestCycleSchema);
