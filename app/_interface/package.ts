import { IUserByAdmin } from "./user";

export interface IPackage {
  id: string;
  type: string;
  name: string;
  testers: number;
  userId: IUserByAdmin;
  durationHours?: number;
  bugs: number;
  moreBugs: Boolean;
  amount: number;
  currency: string;
  description?: string;
  isCustom?: boolean;
  isActive: boolean;
  _id?: string;
}

export interface IPackagePayload {
    type: string;
    name: string;
    testers: number;
    durationHours?: number;
    bugs: number;
    moreBugs: Boolean;
    amount: number;
    currency: string;
    description?: string;
    isCustom?: boolean;
    isActive: boolean;
}
