import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";
import { Counter } from "./counter.model";

export interface ITestPlan extends Document {
  title: string;
  userId: Types.ObjectId;
  projectId: Types.ObjectId;
  customId: number;
  parameters: Types.ObjectId[];
  assignedTo?: Types.ObjectId;
}

const parametersSchema = new Schema({
  parameter: { type: String },
  description: { type: String },
});

const TestPlanSchema = new Schema<ITestPlan>(
  {
    title: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: DBModels.PROJECT,
      required: true,
    },
    customId: { type: Number },
    parameters: [parametersSchema],
    assignedTo: { type: Schema.Types.ObjectId, ref: DBModels.USER },
  },
  {
    timestamps: true,
  }
);

TestPlanSchema.pre("save", async function (next) {
  const testPlan = this;

  if (testPlan.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { entity: DBModels.TEST_PLAN, projectId: testPlan.projectId },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true }
      );

      testPlan.customId = counter.sequence;
      next();
    } catch (err: any) {
      next(err);
    }
  } else {
    next();
  }
});

export const TestPlan =
  mongoose.models.TestPlan ||
  model<ITestPlan>(DBModels.TEST_PLAN, TestPlanSchema);
