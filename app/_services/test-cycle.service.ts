import { PAGINATION_QUERY_ENDPOINT, TEST_CYCLE_ENPOINT } from "../_constants/api-endpoints";
import { ITestCyclePayload } from "../_interface/test-cycle";
import { genericGet, genericPost } from "./generic-api-methods";

export const getTestCycleService = async (projectId: string, index: Number, pageSize: Number):
    Promise<any> => {
    try {
        const response = await genericGet(`${TEST_CYCLE_ENPOINT(projectId)}${PAGINATION_QUERY_ENDPOINT(index, pageSize)}`);
        return response || [];
    } catch (error) {
        console.error(`Error > getTestCycleService:`, error);
        throw error;
    }
};

export const addTestCycleService = async (projectId: string, body: ITestCyclePayload): Promise<any> => {
    try {
        const response = await genericPost(`${TEST_CYCLE_ENPOINT(projectId)}`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > addTestCycleService:`, error);
        throw error;
    }
};