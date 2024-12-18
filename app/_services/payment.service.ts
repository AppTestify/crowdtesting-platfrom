import { PAYMENTS_ENDPOINT } from "../_constants/api-endpoints";
import { IPaymentPayload } from "../_interface/payment";
import { genericGet, genericPost } from "./generic-api-methods";

export const getPaymentsByUserService = async (userId: string): Promise<any> => {
    try {
        const response = await genericGet(`${PAYMENTS_ENDPOINT}/receiver/${userId}`);
        return response || [];
    } catch (error) {
        console.error(`Error > getPaymentsService:`, error);
        throw error;
    }
};

export const addPaymentsService = async (body: IPaymentPayload): Promise<any> => {
    try {
        const response = await genericPost(PAYMENTS_ENDPOINT, body);
        return response || {};
    } catch (error) {
        console.error(`Error > addPaymentsService:`, error);
        throw error;
    }
};