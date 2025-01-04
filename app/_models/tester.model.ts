import mongoose, { Schema, model } from "mongoose";
import { ITester } from "../_interface/tester";
import { DBModels } from "../_constants";

const CertificationSchema = new Schema({
  name: { type: String, required: false },
  issuedBy: { type: String, required: false },
});

const LanguageSchema = new Schema({
  name: { type: String, required: true },
  proficiency: { type: String, required: false },
});

const AddressSchema = new Schema({
  street: { type: String, required: false },
  city: { type: String, required: false },
  postalCode: { type: String, required: false },
  country: { type: String, required: false },
});

const TesterSchema = new Schema({
  skills: [{ type: String, required: false }],
  bio: { type: String },
  certifications: [CertificationSchema],
  languages: [LanguageSchema],
  address: { type: AddressSchema, required: false },
  user: {
    type: Schema.Types.ObjectId,
    ref: DBModels.USER,
    required: true,
  },
});

export const Tester =
  mongoose.models.Tester || model<ITester>(DBModels.TESTER, TesterSchema);
