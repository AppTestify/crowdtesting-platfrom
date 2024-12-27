import { IUserByAdmin } from "./user";

export interface IPaymentPayload {
  // id?: string;
  receiverId: string;
  projectId?: string;
  status?: string;
  description?: string;
  amount: number;
}

export interface IPayment {
  receiverId: IUserByAdmin;
  _id?: string;
  id?: string;
  senderId: IUserByAdmin;
  projectId?: string;
  status?: string;
  description?: string;
  amount?: {
    $numberDecimal?: number;
  };
}
