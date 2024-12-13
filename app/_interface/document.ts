import { IUserByAdmin } from "./user";

export interface IDocument {
  id: string;
  data: string;
  name: string;
  contentType: string;
  fileType: string;
  userId: IUserByAdmin;
}

export interface IUserDocument {
  documnets: IDocument[];
}