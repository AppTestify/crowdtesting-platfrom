import { ADMIN_ENDPOINT } from "../_constants/api-endpoints";
import { IAdmin } from "../_interface/admin";
import { genericGet, genericPut } from "./generic-api-methods";

export const updateAdminProfile = async (body: IAdmin): Promise<any> => {
    try {
        const response = await genericPut(`${ADMIN_ENDPOINT}`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > updateAdminProfile:`, error);
        throw error;
    }
};

export const getAdminProfile = async (): Promise<any> => {
    try {
        const response = await genericGet(`${ADMIN_ENDPOINT}`);
        return response || {};
    } catch (error) {
        console.error(`Error > getAdminProfile:`, error);
        throw error;
    }
};