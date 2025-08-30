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

export const getDashboardAdminService = async (): Promise<any> => {
  try {
    const response = await genericGet(
      `${DASHBOARD_ENDPOINT}/admin`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getDashboardAdminService:`, error);
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

export const getTesterSeverityDashboardService = async (
  projectId?: string,
  status?: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${DASHBOARD_ENDPOINT}/tester/severity?project=${projectId}&status=${status}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getTesterSeverityDashboardService:`, error);
    throw error;
  }
};

export const getTesterPriorityDashboardService = async (
  projectId?: string,
  status?: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${DASHBOARD_ENDPOINT}/tester/priority?project=${projectId}&status=${status}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getTesterPriorityDashboardService:`, error);
    throw error;
  }
};
