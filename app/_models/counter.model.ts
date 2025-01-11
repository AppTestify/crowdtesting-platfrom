import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";

export interface ICounter extends Document {
  entity: string;
  sequence: number;
  projectId?: Types.ObjectId;
}

const CounterSchema = new Schema<ICounter>(
  {
    entity: { type: String, required: true },
    sequence: { type: Number, default: 1 },
    projectId: { type: Types.ObjectId, ref: DBModels.PROJECT, required: false },
  },
  {
    timestamps: true,
  }
);

export const Counter =
  mongoose.models.Counter || model<ICounter>(DBModels.COUNTER, CounterSchema);
