import { DASHBOARD_ENDPOINT } from "../_constants/api-endpoints";
import { genericGet } from "./generic-api-methods";

export const getDashboardService = async (): Promise<any> => {
    try {
        const response = await genericGet(DASHBOARD_ENDPOINT);
        return response || [];
    } catch (error) {
        console.error(`Error > getDashboardService:`, error);
        throw error;
    }
};

export const getDashboardClientService = async (): Promise<any> => {
    try {
        const response = await genericGet(`${DASHBOARD_ENDPOINT}/client`);
        return response || [];
    } catch (error) {
        console.error(`Error > getDashboardClientService:`, error);
        throw error;
    }
};

export const getTesterDashboardService = async (): Promise<any> => {
    try {
        const response = await genericGet(`${DASHBOARD_ENDPOINT}/tester`);
        return response || [];
    } catch (error) {
        console.error(`Error > getTesterDashboardService:`, error);
        throw error;
    }
};