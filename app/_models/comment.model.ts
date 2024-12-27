import mongoose, { Document, Schema, Types, model } from "mongoose";
import { DBModels } from "../_constants";

export interface IComment extends Document {
  entityId: Types.ObjectId;
  entityType: string;
  content: string;
  commentedBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  deletedBy: Types.ObjectId;
  isDelete: boolean;
}

const commentSchema = new Schema<IComment>(
  {
    entityType: { type: String, default: "Issue" },
    entityId: { type: Schema.Types.ObjectId, ref: DBModels.ISSUE },
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
