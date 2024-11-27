import { TEST_CASE_DATA_ENPOINT } from "../_constants/api-endpoints";
import { ITestCaseDataPayload } from "../_interface/test-case-data";
import { genericDelete, genericGet, genericPost } from "./generic-api-methods";

export const addTestCaseDataService = async (projectId: string, testCaseId: string,
    body: ITestCaseDataPayload): Promise<any> => {
    try {
        const response = await genericPost(`${TEST_CASE_DATA_ENPOINT(projectId, testCaseId)}`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > addTestCaseDataService:`, error);
        throw error;
    }
};

export const getTestCaseDataService = async (projectId: string, testCaseId: string):
    Promise<any> => {
    try {
        const response = await genericGet(`${TEST_CASE_DATA_ENPOINT(projectId, testCaseId)}`);
        return response || [];
    } catch (error) {
        console.error(`Error > getTestCaseDataService:`, error);
        throw error;
    }
};

export const deleteTestCaseDataService = async (
    projectId: string,
    testCaseId: string,
    testCaseDataId: string
): Promise<any> => {
    try {
        const response = await genericDelete(`${TEST_CASE_DATA_ENPOINT(projectId, testCaseId)}/${testCaseDataId}`);
        return response || {};
    } catch (error) {
        console.error(`Error > deleteTestCaseDataService:`, error);
        throw error;
    }
};