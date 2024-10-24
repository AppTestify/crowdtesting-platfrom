import mongoose, { Schema, model } from "mongoose";
import { ITester } from "../_interface/tester";
import { DBModels } from "../_constants";

// Schema for Image (Blob)
const ImageSchema = new Schema({
  data: Buffer,
  contentType: String,
});

// Schema for Past Projects
const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: [ImageSchema],
  startDate: { type: Date, required: false },
  endDate: { type: Date, required: false },
});

// Schema for Certifications
const CertificationSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: [ImageSchema],
  issuedBy: { type: String, required: true },
  issueDate: { type: Date, required: true },
  expirationDate: { type: Date, required: false },
});

// Schema for Browsers
const BrowserSchema = new Schema({
  name: { type: String, required: true },
  version: { type: String, required: true },
  platform: { type: String, required: true },
});

// Schema for Address
const AddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

// Schema for Experience (Projects and Certifications)
const ExperienceSchema = new Schema({
  pastProjects: [ProjectSchema],
  certifications: [CertificationSchema],
  isApproved: { type: Boolean, default: false },
});

// Schema for Devices
const DeviceSchema = new Schema({
  model: { type: String, required: true },
  os: { type: String, required: true },
  specifications: { type: String, required: true },
  images: [ImageSchema],
});

// Main Tester Schema
const TesterSchema = new Schema({
  skills: [{ type: String, required: true }],
  browsers: [BrowserSchema],
  experience: { type: ExperienceSchema, required: true },
  devices: [DeviceSchema],
  address: { type: AddressSchema, required: true },
  isApproved: { type: Boolean, default: false },
  user: {
    type: Schema.Types.ObjectId,
    ref: DBModels.USER,
    required: true,
  },
});

export const Tester =
  mongoose.models.Tester || model<ITester>(DBModels.USER, TesterSchema);
