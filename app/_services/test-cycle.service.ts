import { PAGINATION_QUERY_ENDPOINT, TEST_CASE_STEP_ENPOINT, TEST_CYCLE_ENPOINT } from "../_constants/api-endpoints";
import { IAssignedTestCase, ITestCyclePayload, IUnAssignedTestCase } from "../_interface/test-cycle";
import { genericDelete, genericGet, genericPatch, genericPost, genericPut } from "./generic-api-methods";

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

export const deleteTestCycleService = async (
    projectId: string,
    testCycleId: string
): Promise<any> => {
    try {
        const response = await genericDelete(`${TEST_CYCLE_ENPOINT(projectId)}/${testCycleId}`);
        return response || {};
    } catch (error) {
        console.error(`Error > deleteTestCycleService:`, error);
        throw error;
    }
};

export const updateTestCycleService = async (
    projectId: string,
    testCycleId: string,
    body: ITestCyclePayload
): Promise<any> => {
    try {
        const response = await genericPut(`${TEST_CYCLE_ENPOINT(projectId)}/${testCycleId}`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > updateTestCycleService:`, error);
        throw error;
    }
};

export const assignTestCase = async (projectId: string, testCycleId: string, body: IAssignedTestCase): Promise<any> => {
    try {
        const response = await genericPatch(`${TEST_CYCLE_ENPOINT(projectId)}/${testCycleId}/assign-test-cases`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > assignTestCase:`, error);
        throw error;
    }
};

export const unAssignTestCase = async (projectId: string, testCycleId: string, body: IUnAssignedTestCase): Promise<any> => {
    try {
        const response = await genericPatch(`${TEST_CYCLE_ENPOINT(projectId)}/${testCycleId}/un-assign-test-cases`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > unAssignTestCase:`, error);
        throw error;
    }
};

export const getAssignTestCaseService = async (projectId: string, testCaseId: string):
    Promise<any> => {
    try {
        const response = await genericGet(`${TEST_CYCLE_ENPOINT(projectId)}/${testCaseId}/assign-test-cases`);
        return response || [];
    } catch (error) {
        console.error(`Error > getAssignTestCaseService:`, error);
        throw error;
    }
};

export const getTestCycleListService = async (projectId: string):
    Promise<any> => {
    try {
        const response = await genericGet(`${TEST_CYCLE_ENPOINT(projectId)}/list`);
        return response || [];
    } catch (error) {
        console.error(`Error > getTestCycleListService:`, error);
        throw error;
    }
};

export const getTestCycleWithoutPaginationService = async (projectId: string):
    Promise<any> => {
    try {
        const response = await genericGet(`${TEST_CYCLE_ENPOINT(projectId)}/without-pagination`);
        return response || [];
    } catch (error) {
        console.error(`Error > getTestCycleWithoutPaginationService:`, error);
        throw error;
    }
};