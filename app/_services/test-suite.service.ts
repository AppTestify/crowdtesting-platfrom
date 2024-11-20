import { PAGINATION_QUERY_ENDPOINT, TEST_SUITE_ENPOINT } from "../_constants/api-endpoints";
import { ITestSuitePayload } from "../_interface/test-suite";
import { genericDelete, genericGet, genericPost, genericPut } from "./generic-api-methods";

export const getTestSuiteService = async (projectId: string, index: Number, pageSize: Number):
    Promise<any> => {
    try {
        const response = await genericGet(`${TEST_SUITE_ENPOINT(projectId)}${PAGINATION_QUERY_ENDPOINT(index, pageSize)}`);
        return response || [];
    } catch (error) {
        console.error(`Error > getTestSuiteService:`, error);
        throw error;
    }
};

export const addTestSuiteService = async (projectId: string, body: ITestSuitePayload): Promise<any> => {
    try {
        const response = await genericPost(`${TEST_SUITE_ENPOINT(projectId)}`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > addTestSuiteService:`, error);
        throw error;
    }
};

export const deleteTestSuiteService = async (
    projectId: string,
    testSuiteId: string
): Promise<any> => {
    try {
        const response = await genericDelete(`${TEST_SUITE_ENPOINT(projectId)}/${testSuiteId}`);
        return response || {};
    } catch (error) {
        console.error(`Error > deleteTestSuiteService:`, error);
        throw error;
    }
};

export const updateTestSuiteService = async (
    projectId: string,
    testSuiteId: string,
    body: ITestSuitePayload
): Promise<any> => {
    try {
        const response = await genericPut(`${TEST_SUITE_ENPOINT(projectId)}/${testSuiteId}`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > updateTestSuiteService:`, error);
        throw error;
    }
};