import { ADMIN_EMAIL_ENDPOINT, ADMIN_ENDPOINT, ADMIN_SELECTED_EMAIL_ENDPOINT } from "../_constants/api-endpoints";
import { IAdmin, IAdminEmailPayload } from "../_interface/admin";
import { genericGet, genericPost, genericPut } from "./generic-api-methods";

export const updateAdminProfile = async (body: IAdmin): Promise<any> => {
    try {
        const response = await genericPut(`${ADMIN_ENDPOINT}`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > updateAdminProfile:`, error);
        throw error;
    }
};

export const getAdminEmailService = async (): Promise<any> => {
    try {
        const response = await genericGet(`${ADMIN_EMAIL_ENDPOINT}`);
        return response || [];
    } catch (error) {
        console.error(`Error > getAdminEmailService:`, error);
        throw error;
    }
};

export const updateAdminEmailService = async (body: IAdminEmailPayload): Promise<any> => {
    try {
        const response = await genericPost(`${ADMIN_EMAIL_ENDPOINT}`, body);
        return response || [];
    } catch (error) {
        console.error(`Error > updateAdminEmailService:`, error);
        throw error;
    }
};

export const getSelectedAdminEmailService = async (): Promise<any> => {
    try {
        const response = await genericGet(`${ADMIN_SELECTED_EMAIL_ENDPOINT}`);
        return response || [];
    } catch (error) {
        console.error(`Error > getSelectedAdminEmailService:`, error);
        throw error;
    }
};