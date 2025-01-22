import { MAIL_ENDPOINT } from "../_constants/api-endpoints";
import { IMailPayload } from "../_interface/mail";
import { genericGet, genericPost } from "./generic-api-methods";

export const addMailService = async (body: IMailPayload): Promise<any> => {
  try {
    const response = await genericPost(MAIL_ENDPOINT, body);
    return response || {};
  } catch (error) {
    console.error(`Error > addMailService:`, error);
    throw error;
  }
};

export const getMailService = async (): Promise<any> => {
  try {
    const response = await genericGet(MAIL_ENDPOINT);
    return response || {};
  } catch (error) {
    console.error(`Error > getMailService:`, error);
    throw error;
  }
};
