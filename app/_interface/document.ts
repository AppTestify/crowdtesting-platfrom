import { IUserByAdmin } from "./user";

export interface IDocument {
  id: string;
  data: string;
  name: string;
  contentType: string;
  fileType: string;
  userId: IUserByAdmin;
  verifyBy: IUserByAdmin
}

export interface IUserDocument {
  documnets: IDocument[];
}

export interface IDocumentApprovalPayload {
  emails: string[];
  documentName: string;
  documentType: string;
  firstName: string;
  lastName: string;
  link: string;
}