import {
  LOGOUT,
  SIGN_IN_ENDPOINT,
  SIGN_UP_ENDPOINT,
  UPDATE_ROLE,
} from "../_constants/api-endpoints";
import { StorageKey } from "../_constants/localstorage-keys";
import { ISignInPayload, ISignUpPayload } from "../_interface/auth";
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
