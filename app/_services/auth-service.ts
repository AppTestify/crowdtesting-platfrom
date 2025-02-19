import {
  ACCOUNT_VERIFICATION_ENDPOINT,
  ACCOUNT_VERIFICATION_RESEND_ENDPOINT,
  FORGOT_PASSWORD_ENDPOINT,
  LOGOUT,
  RESET_PASSWORD_ENDPOINT,
  SIGN_IN_ENDPOINT,
  SIGN_UP_ENDPOINT,
  UPDATE_ROLE,
} from "../_constants/api-endpoints";
import { StorageKey } from "../_constants/localstorage-keys";
import {
  IAccountVerificationPayload,
  IForgotPasswordPayload,
  IResetPasswordPayload,
  ISignInPayload,
  ISignUpPayload,
} from "../_interface/auth";
import { genericPatch, genericPost } from "./generic-api-methods";
import { getItem } from "./localstorage";

export const getPrincipalUser = () => {
  return getItem(StorageKey.PRINCIPAL_USER);
};

export const isUserLoggedIn = () => {
  return getItem(StorageKey.PRINCIPAL_USER) && getItem(StorageKey.TOKEN)
    ? true
    : false;
};

export const logOutUserService = async () => {
  await genericPost(LOGOUT, {});
};

export const updateUserRole = async (user: any, role: string): Promise<any> => {
  try {
    if (user) {
      const parsedUser = JSON.parse(user);
      const response = await genericPatch(
        UPDATE_ROLE,
        {
          _id: parsedUser._id,
          role,
        },
        process.env.URL
      );
      return response;
    }

    return null;
  } catch (error) {
    throw error;
  }
};

export const signUpService = async (body: ISignUpPayload): Promise<any> => {
  try {
    const response = await genericPost(SIGN_UP_ENDPOINT, body, process.env.URL);
    return response;
  } catch (error) {
    console.error(`Error > signUpService:`, error);
    throw error;
  }
};

export const signInService = async (body: ISignInPayload): Promise<any> => {
  try {
    const response = await genericPost(SIGN_IN_ENDPOINT, body, process.env.URL);
    return response;
  } catch (error: any) {
    console.error(`Error > signInService:`, error.message);
    throw error;
  }
};

export const accountVerificationService = async (
  body: IAccountVerificationPayload
): Promise<any> => {
  try {
    const response = await genericPost(ACCOUNT_VERIFICATION_ENDPOINT, body);
    return response;
  } catch (error) {
    console.error(`Error > accountVerificationService:`, error);
    throw error;
  }
};

export const resendAccountVerificationMailService = async (): Promise<any> => {
  try {
    const response = await genericPost(
      ACCOUNT_VERIFICATION_RESEND_ENDPOINT,
      {}
    );
    return response;
  } catch (error) {
    console.error(`Error > resendAccountVerificationMailService:`, error);
    throw error;
  }
};

export const forgotPasswordService = async (
  body: IForgotPasswordPayload
): Promise<any> => {
  try {
    const response = await genericPost(FORGOT_PASSWORD_ENDPOINT, body);
    return response;
  } catch (error: any) {
    console.error(`Error > forgotPasswordService:`, error.message);
    throw error;
  }
};

export const resetPasswordService = async (
  body: IResetPasswordPayload
): Promise<any> => {
  try {
    const response = await genericPost(RESET_PASSWORD_ENDPOINT, body);
    return response;
  } catch (error: any) {
    console.error(`Error > resetPasswordService:`, error.message);
    throw error;
  }
};
