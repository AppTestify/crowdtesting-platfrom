import { IUserByAdmin } from "./user";

export interface IMailPayload {
  subject: string;
  emails: string[];
  body: string;
}

export interface IMail {
  subject: string;
  emails: string[];
  body: string;
  id: string;
  createdAt: string;
  userId?: IUserByAdmin;
}
