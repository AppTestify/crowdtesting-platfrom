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
        customId: { type: Number }
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