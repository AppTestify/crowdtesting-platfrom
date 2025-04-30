import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";
import { AmountType, AmountTypeList } from "../_constants/payment";

export interface IAddOn extends Document {
  name: string;
  description?: string;
  amountType: string;
  amount: number;
  userId: Types.ObjectId;
  isActive: boolean;
}

const AddOnSchema = new Schema<IAddOn>(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    amountType: {
      type: String,
      default: AmountType.FLAT
    },
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
