import { IUserByAdmin } from "./user";

export interface IInvoicePayload {
  attachments: File[];
}

export interface IInvoice {
  id: string;
  data: string;
  name: string;
  contentType: string;
  cloudId: string;
  createdAt: string;
  userId: IUserByAdmin;
}
