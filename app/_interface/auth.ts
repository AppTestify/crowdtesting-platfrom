import { UserRoles } from "../_constants/user-roles";

export interface ISignUpPayload {
  email: string;
  password: string;
  role: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  createdBy?: 'self' | 'admin';
}

export interface ISignInPayload {
  email: string;
  password: string;
}

export interface IAccountVerificationPayload {
  token: string;
}

export interface IForgotPasswordPayload {
  email: string;
  resetLink?: string;
}

export interface IResetPasswordPayload {
  password: string;
  confirmedPassword: string;
  token: string;
}
