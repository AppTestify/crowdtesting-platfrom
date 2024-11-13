import mongoose, { Document, model, Schema } from "mongoose";
import { DBModels } from "../_constants";

export interface IUniqueId extends Document {
    entity: string;
    idFormat: string;
}

const IdFormatSchema = new Schema<IUniqueId>(
    {
        entity: { type: String, required: true },
        idFormat: { type: String }
    },
    {
        timestamps: true
    }
)

export const IdFormat =
    mongoose.models.IdFormat || model<IUniqueId>(DBModels.ID_FORMAT, IdFormatSchema);