import mongoose, { Schema, Document, model } from "mongoose";
import { DBModels } from "../_constants";

export interface IRequirementAttachment extends Document {
    data: Buffer;
    name: string;
    contentType: string;
    requirementId: string;
}

const IssueAttachmentSchema: Schema = new Schema(
    {
        data: Buffer,
        name: String,
        contentType: String,
        requirementId: String,
    },
    { timestamps: true }
);

export const RequirementAttachment =
    mongoose.models.RequirementAttachment ||
    model<IRequirementAttachment>(DBModels.REQUIREMENT_ATTACHMENT, IssueAttachmentSchema);
