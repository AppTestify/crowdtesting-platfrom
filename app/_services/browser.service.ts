import { BROWSERS_ENDPOINT } from "../_constants/api-endpoints";
import { genericGet } from "./generic-api-methods";

export const getBrowserService = async (): Promise<any> => {
  try {
    const response = await genericGet(BROWSERS_ENDPOINT);
    return response || [];
  } catch (error) {
    console.error(`Error > getBrowserService:`, error);
    throw error;
  }
};
