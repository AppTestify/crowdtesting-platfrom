import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";

export interface ITask extends Document {
  title: string;
  priority: string;
  status: string;
  description: string;
  issueId: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  userId: Types.ObjectId;
  projectId: Types.ObjectId;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    priority: { type: String, required: true },
    status: { type: String, required: true },
    description: { type: String, required: true },
    issueId: {
      type: Schema.Types.ObjectId,
      ref: DBModels.ISSUE,
      required: false,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: DBModels.USER,
      required: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: DBModels.USER,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: DBModels.PROJECT,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Task =
  mongoose.models.Task || model<ITask>(DBModels.TASK, TaskSchema);
