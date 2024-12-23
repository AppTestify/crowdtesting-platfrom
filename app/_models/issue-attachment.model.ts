import mongoose, { Schema, Document, model } from "mongoose";
import { DBModels } from "../_constants";

export interface IIssueAttachemnt extends Document {
    cloudId: string;
    name: string;
    contentType: string;
    issueId: string;
}

const IssueAttachmentSchema: Schema = new Schema(
    {
        cloudId: { type: String, unique: true },
        name: String,
        contentType: String,
        issueId: String,
    },
    { timestamps: true }
);

export const IssueAttachment =
    mongoose.models.IssueAttachment ||
    model<IIssueAttachemnt>(DBModels.ISSUE_ATTACHMENT, IssueAttachmentSchema);
