import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";
import { Counter } from "./counter.model";

export interface IIssue extends Document {
    title: string;
    severity: string;
    priority: string;
    description: string;
    attachments: Types.ObjectId[];
    userId: Types.ObjectId;
    projectId: Types.ObjectId;
    status: string;
    customId: number;
    device: Types.ObjectId[];
}

const IssueSchema = new Schema<IIssue>(
    {
        title: { type: String, required: true },
        severity: { type: String, required: false },
        priority: { type: String, required: false },
        description: { type: String, required: false },
        attachments: [
            { type: Schema.Types.ObjectId, ref: DBModels.ISSUE_ATTACHMENT }
        ],
        userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
        projectId: { type: Schema.Types.ObjectId, ref: DBModels.PROJECT, required: true },
        status: { type: String, required: true },
        customId: { type: Number },
        device: [
            { type: Schema.Types.ObjectId, ref: DBModels.DEVICE }
        ],
    },
    {
        timestamps: true
    }
);

IssueSchema.pre('save', async function (next) {
    const issue = this;

    if (issue.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { entity: DBModels.ISSUE },
                { $inc: { sequence: 1 } },
                { new: true, upsert: true }
            );

            issue.customId = counter.sequence;
            next();
        } catch (err: any) {
            next(err);
        }
    } else {
        next();
    }
});

export const Issue =
    mongoose.models.Issue || model<IIssue>(DBModels.ISSUE, IssueSchema);