import { PAGINATION_QUERY_ENDPOINT, TEST_PLAN_ENPOINT } from "../_constants/api-endpoints";
import { ITestPlanPayload } from "../_interface/test-plan";
import { genericGet, genericPost } from "./generic-api-methods";

export const getTestPlanService = async (projectId: string, index: Number, pageSize: Number):
    Promise<any> => {
    try {
        const response = await genericGet(`${TEST_PLAN_ENPOINT(projectId)}${PAGINATION_QUERY_ENDPOINT(index, pageSize)}`);
        return response || [];
    } catch (error) {
        console.error(`Error > getTestPlanService:`, error);
        throw error;
    }
};

export const addTestPlanService = async (projectId: string, body: ITestPlanPayload): Promise<any> => {
    try {
        const response = await genericPost(`${TEST_PLAN_ENPOINT(projectId)}`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > addTestPlanService:`, error);
        throw error;
    }
};