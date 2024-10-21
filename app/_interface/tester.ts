import { Document } from "mongoose";

// Interface for Images as Blobs
interface IImage {
  data: Buffer;
  contentType: string;
}

// Interface for Past Projects
interface IProject {
  name: string;
  description: string;
  images: IImage[];
  startDate?: Date;
  endDate?: Date;
}

// Interface for Certifications
interface ICertification {
  name: string;
  description: string;
  images: IImage[];
  issuedBy: string;
  issueDate: Date;
  expirationDate?: Date;
}

// Interface for Browsers
interface IBrowser {
  name: string;
  version: string;
  platform: string;
}

// Interface for Address
interface IAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Interface for Devices
interface IDevice {
  model: string;
  os: string;
  specifications: string;
  images: IImage[];
}

// Interface for Experience (Projects and Certifications)
interface IExperience {
  pastProjects: IProject[];
  certifications: ICertification[];
  isApproved: boolean;
}

// Main Tester Interface
export interface ITester extends Document {
  skills: string[];
  browsers: IBrowser[];
  experience: IExperience;
  devices: IDevice[];
  address: IAddress;
  isApproved: boolean;
}


export interface IAddressData {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}