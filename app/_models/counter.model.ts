import mongoose, { Document, model, Schema } from "mongoose";
import { DBModels } from "../_constants";

export interface ICounter extends Document {
  entity: string;
  sequence: number;
}

const CounterSchema = new Schema<ICounter>(
  {
    entity: { type: String, required: true },
    sequence: { type: Number, default: 1 }
  },
  {
    timestamps: true,
  }
);

export const Counter =
  mongoose.models.Counter || model<ICounter>(DBModels.COUNTER, CounterSchema);
