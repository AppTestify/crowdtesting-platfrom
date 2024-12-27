import {
  PAYMENTS_ENDPOINT,
  PROJECTS_ENDPOINT,
} from "../_constants/api-endpoints";
import { IPayment, IPaymentPayload } from "../_interface/payment";
import {
  genericDelete,
  genericGet,
  genericPost,
  genericPut,
} from "./generic-api-methods";

export const getPaymentsByUserService = async (
  userId: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${PAYMENTS_ENDPOINT}/receiver/${userId}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getPaymentsService:`, error);
    throw error;
  }
};

export const addPaymentsService = async (
  body: IPaymentPayload
): Promise<any> => {
  try {
    const response = await genericPost(PAYMENTS_ENDPOINT, body);
    return response || {};
  } catch (error) {
    console.error(`Error > addPaymentsService:`, error);
    throw error;
  }
};

export const deletePaymentService = async (id: string): Promise<any> => {
  try {
    const response = await genericDelete(`${PAYMENTS_ENDPOINT}/id/${id}`);
    return response || {};
  } catch (error) {
    console.error(`Error > deletePaymentService:`, error);
    throw error;
  }
};

export const updatePaymentService = async (
  id: string,
  body: IPaymentPayload
): Promise<any> => {
  try {
    const response = await genericPut(`${PAYMENTS_ENDPOINT}/id/${id}`, body);
    return response || {};
  } catch (error) {
    console.error(`Error > updatePaymentService:`, error);
    throw error;
  }
};
