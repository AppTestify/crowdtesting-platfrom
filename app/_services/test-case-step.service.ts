import { TEST_CASE_STEP_ENPOINT } from "../_constants/api-endpoints";
import { ITestCaseStep, ITestCaseStepPayload, ITestCaseStepSequencePayload } from "../_interface/test-case-step";
import { genericDelete, genericGet, genericPost, genericPut } from "./generic-api-methods";

export const addTestCaseStepService = async (projectId: string, testCaseId: string,
    body: ITestCaseStepPayload): Promise<any> => {
    try {
        const response = await genericPost(`${TEST_CASE_STEP_ENPOINT(projectId, testCaseId)}`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > addTestCaseStepService:`, error);
        throw error;
    }
};

export const getTestCaseStepService = async (projectId: string, testCaseId: string):
    Promise<any> => {
    try {
        const response = await genericGet(`${TEST_CASE_STEP_ENPOINT(projectId, testCaseId)}`);
        return response || [];
    } catch (error) {
        console.error(`Error > getTestCaseStepService:`, error);
        throw error;
    }
};

export const updateTestCaseSequenceService = async (
    projectId: string,
    testCaseId: string,
    body: ITestCaseStepSequencePayload
): Promise<any> => {
    try {
        const response = await genericPut(`${TEST_CASE_STEP_ENPOINT(projectId, testCaseId)}/reorder`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > updateTestCaseSequenceService:`, error);
        throw error;
    }
};

export const updateTestCaseStepService = async (
    projectId: string,
    testCaseId: string,
    testCaseStepId: string,
    body: ITestCaseStep
): Promise<any> => {
    try {
        const response = await genericPut(`${TEST_CASE_STEP_ENPOINT(projectId, testCaseId)}/test-case-step/${testCaseStepId}`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > updateTestCaseStepService:`, error);
        throw error;
    }
};

export const deleteTestCaseStepService = async (
    projectId: string,
    testCaseId: string,
    testCaseStepId: string
): Promise<any> => {
    try {
        const response = await genericDelete(`${TEST_CASE_STEP_ENPOINT(projectId, testCaseId)}/test-case-step/${testCaseStepId}`);
        return response || {};
    } catch (error) {
        console.error(`Error > deleteTestCaseStepService:`, error);
        throw error;
    }
};