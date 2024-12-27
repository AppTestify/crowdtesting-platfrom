import mongoose, { Document, Schema, Types, model } from "mongoose";
import { DBModels } from "../_constants";

export interface IComment extends Document {
  entityId: string;
  entityType: string;
  content: string;
  commentedBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  deletedBy: Types.ObjectId;
  isDelete: boolean;
}

const commentSchema = new Schema<IComment>(
  {
    entityId: { type: String, required: true },
    entityType: { type: String, required: true },
    content: { type: String, required: true },
    commentedBy: { type: Schema.Types.ObjectId, ref: DBModels.USER },
    updatedBy: { type: Schema.Types.ObjectId, ref: DBModels.USER },
    deletedBy: { type: Schema.Types.ObjectId, ref: DBModels.USER },
    isDelete: { type: Boolean, required: false, default: false },
  },
  {
    timestamps: true,
  }
);

export const Comment =
  mongoose.models.Comment || model<IComment>(DBModels.COMMENT, commentSchema);
