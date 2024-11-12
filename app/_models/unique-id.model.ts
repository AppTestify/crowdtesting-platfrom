import mongoose, { Document, model, Schema } from "mongoose";
import { DBModels } from "../_constants";

export interface IUniqueId extends Document {
    text: string;
}

const UniqueIdSchema = new Schema<IUniqueId>(
    {
        text: { type: String, required: true },
    },
    {
        timestamps: true
    }
)

export const UniqueId =
    mongoose.models.UniqueId || model<IUniqueId>(DBModels.UNIQUE_ID, UniqueIdSchema);