import { PAGINATION_QUERY_ENDPOINT, TEST_CASE_ENPOINT } from "../_constants/api-endpoints";
import { ITestCasePayload } from "../_interface/test-case";
import { genericDelete, genericGet, genericPost, genericPut } from "./generic-api-methods";

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

export const deleteTestCaseService = async (
    projectId: string,
    testCaseId: string
): Promise<any> => {
    try {
        const response = await genericDelete(`${TEST_CASE_ENPOINT(projectId)}/${testCaseId}`);
        return response || {};
    } catch (error) {
        console.error(`Error > deleteTestCaseService:`, error);
        throw error;
    }
};

export const updateTestCaseService = async (
    projectId: string,
    testSuiteId: string,
    body: ITestCasePayload
): Promise<any> => {
    try {
        const response = await genericPut(`${TEST_CASE_ENPOINT(projectId)}/${testSuiteId}`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > updateTestCaseService:`, error);
        throw error;
    }
};

export const getTestCaseWithoutPaginationService = async (projectId: string):
    Promise<any> => {
    try {
        const response = await genericGet(`${TEST_CASE_ENPOINT(projectId)}/without-pagination`);
        return response || [];
    } catch (error) {
        console.error(`Error > getTestCaseWithoutPaginationService:`, error);
        throw error;
    }
};
