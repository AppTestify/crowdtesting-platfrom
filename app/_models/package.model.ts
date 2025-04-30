import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";

export interface IPackage extends Document {
  type: string;
  name: string;
  testers: number;
  userId: Types.ObjectId;
  durationHours?: number;
  bugs: number;
  moreBugs: Boolean;
  amount: number;
  currency: string;
  description?: string;
  isCustom?: boolean;
  isActive: boolean;
}

const PackageSchema = new Schema<IPackage>(
  {
    type: { type: String, required: true },
    name: { type: String, required: false },
    description: { type: String, required: false },
    testers: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
    durationHours: { type: Number, required: true },
    amount: { type: Number, required: true },
    currency: { type: String , required: true },
    bugs: { type: Number, required: true },
    moreBugs: { type: Boolean, default: false },
    isCustom: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Package =
  mongoose.models.Package ||
  model<IPackage>(DBModels.PACKAGE, PackageSchema);
