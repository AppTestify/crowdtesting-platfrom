import { IUserByAdmin } from "./user";

export interface IAddon {
  id: string;
  name: string;
  description?: string;
  amountType: "flat" | "percentage";
  amount: number;
  userId: IUserByAdmin;
  isActive: boolean;
  _id?: string;
}

export interface IAddonPayload {
  name: string;
  description?: string;
  amountType: "flat" | "percentage";
  amount: number;
  userId: IUserByAdmin;
  isActive: boolean;
}
