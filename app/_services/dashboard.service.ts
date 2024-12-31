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

export const getDashboardClientService = async (
  projectId?: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${DASHBOARD_ENDPOINT}/client?project=${projectId}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getDashboardClientService:`, error);
    throw error;
  }
};

export const getTesterDashboardService = async (
  projectId?: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${DASHBOARD_ENDPOINT}/tester?project=${projectId}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getTesterDashboardService:`, error);
    throw error;
  }
};
