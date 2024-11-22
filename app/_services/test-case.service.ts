import { PAGINATION_QUERY_ENDPOINT, TEST_CASE_ENPOINT } from "../_constants/api-endpoints";
import { ITestCasePayload } from "../_interface/test-case";
import { genericGet, genericPost } from "./generic-api-methods";

export const getTestCaseService = async (projectId: string, index: Number, pageSize: Number):
    Promise<any> => {
    try {
        const response = await genericGet(`${TEST_CASE_ENPOINT(projectId)}${PAGINATION_QUERY_ENDPOINT(index, pageSize)}`);
        return response || [];
    } catch (error) {
        console.error(`Error > getTestCaseService:`, error);
        throw error;
    }
};

export const addTestCaseService = async (projectId: string, body: ITestCasePayload): Promise<any> => {
    try {
        const response = await genericPost(`${TEST_CASE_ENPOINT(projectId)}`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > addTestCaseService:`, error);
        throw error;
    }
};