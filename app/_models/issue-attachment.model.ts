import mongoose, { Schema, Document, model } from "mongoose";
import { DBModels } from "../_constants";

export interface IIssueAttachemnt extends Document {
    data: Buffer;
    name: string;
    contentType: string;
    issueId: string;
}

const IssueAttachmentSchema: Schema = new Schema(
    {
        data: Buffer,
        name: String,
        contentType: String,
        issueId: String,
    },
    { timestamps: true }
);

export const IssueAttachment =
    mongoose.models.IssueAttachment ||
    model<IIssueAttachemnt>(DBModels.ISSUE_ATTACHMENT, IssueAttachmentSchema);
