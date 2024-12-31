import { IDocument } from "./document";
import { ITester } from "./tester";

export interface IUser {
  email: string;
  id: string;
  image: string;
  name: string;
  isActive?: boolean;
  profilePicture?: IProfilePicture;
  _id?: string;
}

export interface IProfilePicture {
  _id: string;
  data: string;
  contentType: string;
  name: string;
}

export interface IUserByAdmin {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  isActive?: boolean;
  id?: string;
  profilePicture?: IProfilePicture;
  createdAt?: string;
  sendCredentials?: boolean;
  tester?: ITester;
  paypalId?: string;
  customId?: string;
  file?: IDocument;
}

export interface IUsersBulkDeletePayload {
  ids: string[];
}

export interface IUserCredentialsEmail {
  email: string;
  password: string;
  role: string;
}

export interface IUserPassword {
  password: string;
  confirmedPassword: string;
  oldPassword: string;
}

export interface INewUser {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
}

export interface IClientWelcomePayload {
  name: string;
  email: string;
  link: string;
  greeting?: string;
}

export interface ITesterWelcomePayload {
  name: string;
  email: string;
  link: string;
}
