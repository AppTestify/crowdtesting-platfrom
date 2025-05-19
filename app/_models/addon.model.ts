import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";
import { AmountType, AmountTypeList } from "../_constants/payment";

export interface IAddOn extends Document {
  name: string;
  description?: string;
  currency: string;
  amount: number;
  userId: Types.ObjectId;
  isActive: boolean;
}

const AddOnSchema = new Schema<IAddOn>(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    currency: { type: String , required: true },
    amount: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const AddOn =
  mongoose.models.AddOn ||
  model<IAddOn>(DBModels.ADDON, AddOnSchema);
