import { MODERATE_ENDPOINT, PAGINATION_QUERY_ENDPOINT, TEST_CYCLE_ENPOINT } from "../_constants/api-endpoints";
import { ITestCaseResultPayload } from "../_interface/test-case-result";
import { genericGet, genericPut } from "./generic-api-methods";

export const getTestExecutionsService = async (projectId: string, testCycleId: string, index: Number, pageSize: Number, result: string):
    Promise<any> => {
    try {
        const response = await genericGet(`${TEST_CYCLE_ENPOINT(projectId)}/${testCycleId}/test-execution${PAGINATION_QUERY_ENDPOINT(index, pageSize)}&result=${result}`);
        return response || [];
    } catch (error) {
        console.error(`Error > getTestExecutionsService:`, error);
        throw error;
    }
};

export const testModerateService = async (
    projectId: string,
    testCaseExecutionId: string,
    body: ITestCaseResultPayload
): Promise<any> => {
    try {
        const response = await genericPut(`${MODERATE_ENDPOINT(projectId, testCaseExecutionId)}`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > testModerateService:`, error);
        throw error;
    }
};