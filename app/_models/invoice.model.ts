import mongoose, { Document, Types, Schema, model } from "mongoose";
import { DBModels } from "../_constants";

export interface IInvoice extends Document {
  userId: Types.ObjectId;
  cloudId: string;
  name: string;
  contentType: string;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
    cloudId: { type: String, unique: true },
    name: String,
    contentType: String,
  },
  {
    timestamps: true,
  }
);

export const Invoice =
  mongoose.models.Invoice || model<IInvoice>(DBModels.INVOICE, InvoiceSchema);
