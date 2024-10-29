import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";

export interface IProject extends Document {
    title: string;
    startDate: Date;
    endDate: Date;
    description: string;
    isActive: Boolean;
    userId: Types.ObjectId;
}

const ProjectSchema = new Schema<IProject>(
    {
        title: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        description: { type: String, required: false },
        isActive: { type: Boolean, required: true },
        userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
    },
    {
        timestamps: true,
    }
);

export const Project = mongoose.models.Project || model<IProject>(DBModels.PROJECT, ProjectSchema);