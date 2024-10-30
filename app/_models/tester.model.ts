import mongoose, { Schema, model } from "mongoose";
import { ITester } from "../_interface/tester";
import { DBModels } from "../_constants";

const CertificationSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  issuedBy: { type: String, required: true },
  issueDate: { type: Date, required: true },
});

const AddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

const TesterSchema = new Schema({
  skills: [{ type: String, required: true }],
  bio: { type: String },
  certifications: [CertificationSchema],
  address: { type: AddressSchema, required: true },
  user: {
    type: Schema.Types.ObjectId,
    ref: DBModels.USER,
    required: true,
  },
});

export const Tester =
  mongoose.models.Tester || model<ITester>(DBModels.TESTER, TesterSchema);
