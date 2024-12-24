import mongoose, { Schema, Document, model } from "mongoose";
import { DBModels } from "../_constants";

export interface IRequirementAttachment extends Document {
    cloudId: string;
    name: string;
    contentType: string;
    requirementId: string;
}

const IssueAttachmentSchema: Schema = new Schema(
    {
        cloudId: { type: String, unique: true },
        name: String,
        contentType: String,
        requirementId: String,
    },
    { timestamps: true }
);

export const RequirementAttachment =
    mongoose.models.RequirementAttachment ||
    model<IRequirementAttachment>(DBModels.REQUIREMENT_ATTACHMENT, IssueAttachmentSchema);
