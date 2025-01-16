import { Document } from "mongoose";
import { ILanguage } from "../(routes)/private/profile/_components/tester-profile/_components/languages";

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
  bio?: string;
  certifications?: ICertification[];
  languages?: ILanguage[];
}

export interface IUserInfoData {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Timezone {
  zoneName: string;
  gmtOffset: number;
  gmtOffsetName: string;
  abbreviation: string;
  tzName: string;
  _id: string;
}

export interface Country {
  _id: string;
  masterId: string;
  description: string;
  shortCode: string;
  shortCode3: string;
  phoneCode: string;
  currency: string;
  currencySymbol: string;
  currencyName: string;
  region: string;
  emojiU: string;
  timezone: Timezone[];
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface States {
  _id: string;
  masterId: string;
  description: string;
  countryId: string;
  shortCode: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileSideBarItem {
  id: number;
  value: string;
  label: string;
}

export interface Skill {
  value: string;
  label: string;
}
export interface Certificate {
  value: string;
  label: string;
}

export interface ItemListingProps {
  defualtItems: Skill[];
  info: string;
}

export interface ICertificatesView {
  certificate: ICertification[];
}
