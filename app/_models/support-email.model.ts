import mongoose, { Document, model, Schema } from "mongoose";
import { DBModels } from "../_constants";

export interface ISupportEmail extends Document {
    emails: [string];
}

const SupportEmailSchema = new Schema<ISupportEmail>(
    {
        emails: [{ type: String }],
    },
    {
        timestamps: true,
    }
);

export const SupportEmail =
    mongoose.models.SupportEmail || model<ISupportEmail>(DBModels.SUPPORT_EMAIL, SupportEmailSchema);