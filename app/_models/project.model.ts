import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";
import { Counter } from "./counter.model";

export interface IProject extends Document {
  title: string;
  startDate?: Date;
  endDate?: Date;
  description: string;
  isActive: Boolean;
  users: Types.ObjectId[];
  userId: Types.ObjectId;
  customId: number;
  deletedAt?: Date;
}

const ProjectUserSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
    role: { type: String },
    customId: { type: Number },
    isVerify: { type: Boolean, default: true },
    testCycles: [{ type: Schema.Types.ObjectId, ref: DBModels.TEST_CYCLE }],
  },
  { timestamps: true }
);

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    description: { type: String, required: false },
    isActive: { type: Boolean, required: true },
    users: [ProjectUserSchema],
    userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
    customId: { type: Number },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

ProjectSchema.pre("save", async function (next) {
  const project = this;

  if (project.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { entity: DBModels.PROJECT },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true }
      );

      project.customId = counter.sequence;
      next();
    } catch (err: any) {
      next(err);
    }
  } else {
    next();
  }
});

export const Project =
  mongoose.models.Project || model<IProject>(DBModels.PROJECT, ProjectSchema);
