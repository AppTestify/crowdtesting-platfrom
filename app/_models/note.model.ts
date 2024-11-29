import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";

export interface INote extends Document {
    title: string;
    description: string;
    userId: Types.ObjectId;
    projectId: Types.ObjectId;
}


const NoteSchema = new Schema<INote>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
        projectId: { type: Schema.Types.ObjectId, ref: DBModels.PROJECT, required: true },
    },
    {
        timestamps: true,
    }
);

export const Note =
    mongoose.models.Note || model<INote>(DBModels.NOTE, NoteSchema);
