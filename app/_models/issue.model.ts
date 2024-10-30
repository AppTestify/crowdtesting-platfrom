import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";

export interface IIssue extends Document {
    title: string;
    severity: string;
    priority: string;
    description: string;
    attachments: Types.ObjectId[];
    userId: Types.ObjectId;
    projectId: Types.ObjectId;
    status: string;
}

const IssueSchema = new Schema<IIssue>(
    {
        title: { type: String, required: true },
        severity: { type: String, required: true },
        priority: { type: String, required: true },
        description: { type: String, required: true },
        attachments: [
            { type: Schema.Types.ObjectId, ref: DBModels.ISSUE_ATTACHMENT }
        ],
        userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
        projectId: { type: Schema.Types.ObjectId, ref: DBModels.PROJECT, required: true },
        status: { type: String, required: true },
    },
    {
        timestamps: true
    }
)

export const Issue =
    mongoose.models.Issue || model<IIssue>(DBModels.ISSUE, IssueSchema);