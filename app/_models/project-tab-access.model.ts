import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";

export interface IProjectTabAccess extends Document {
  projectId: Types.ObjectId;
  tabAccess: any;
}

const TabAccessSchema = new Schema(
  {
    label: { type: String },
    key: { type: String },
    roles: [{ type: String }],
    access: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProjectTabAccessSchema = new Schema<IProjectTabAccess>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: DBModels.PROJECT,
      required: true,
    },
    tabAccess: [TabAccessSchema],
  },
  {
    timestamps: true,
  }
);

export const ProjectTabAccess =
  mongoose.models.ProjectTabAccess ||
  model<IProjectTabAccess>(DBModels.PROJECT_TAB_ACCESS, ProjectTabAccessSchema);
