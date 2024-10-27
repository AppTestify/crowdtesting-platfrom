import { UserRoles } from "../_constants/user-roles";

export interface ISignUpPayload {
  email: string;
  password: string;
  role: string;
}

export interface ISignInPayload {
  email: string;
  password: string;
}

export interface IAccountVerificationPayload {
  token: string;
}
