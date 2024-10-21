import {
  GET_USER_ENDPOINT,
  SIGN_UP_ENDPOINT,
} from "../_constants/api-endpoints";
import { genericGet } from "./generic-api-methods";

export const getUserByEmailService = async (email: string): Promise<any> => {
  try {
    const response = await genericGet(GET_USER_ENDPOINT(email));
    return response;
  } catch (error) {
    console.error(`Error > getUserByEmailService:`, error);
    throw error;
  }
};
