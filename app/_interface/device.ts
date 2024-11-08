import { IUserByAdmin } from "./user";

export interface IDevice {
  id: string;
  name: string;
  os: string;
  version: string;
  browsers: string[];
  country: string;
  city: string;
  network: string;
  userId?: IUserByAdmin;
  _id?: string;
}

export interface IDevicePayload {
  name: string;
  os: string;
  version?: string;
  browsers: string[];
  country?: string;
  city?: string;
  network?: string;
}

export interface IDevicesBulkDeletePayload {
  ids: string[];
}
