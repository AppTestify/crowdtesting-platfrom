import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";
import { Counter } from "./counter.model";

export interface IRequirement extends Document {
  title: string;
  description: string;
  userId: Types.ObjectId;
  projectId: Types.ObjectId;
  customId: number;
  attachments: Types.ObjectId[];
  assignedTo?: Types.ObjectId;
  status: string;
  startDate: Date;
  endDate: Date;
}

const RequirementSchema = new Schema<IRequirement>(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: DBModels.PROJECT,
      required: true,
    },
    customId: { type: Number },
    attachments: [
      { type: Schema.Types.ObjectId, ref: DBModels.REQUIREMENT_ATTACHMENT },
    ],
    assignedTo: { type: Schema.Types.ObjectId, ref: DBModels.USER },
    status: { type: String, required: true },
      startDate: { type: Date, required: false },
      endDate: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

RequirementSchema.pre("save", async function (next) {
  const requirement = this;

  if (requirement.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { entity: DBModels.REQUIREMENT, projectId: requirement.projectId },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true }
      );

      requirement.customId = counter.sequence;
      next();
    } catch (err: any) {
      next(err);
    }
  } else {
    next();
  }
});

export const Requirement =
  mongoose.models.Requirement ||
  model<IRequirement>(DBModels.REQUIREMENT, RequirementSchema);
