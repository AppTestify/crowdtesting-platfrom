import {
  PROJECTS_ENDPOINT,
  TEST_CASE_DATA_ENPOINT,
} from "../_constants/api-endpoints";
import { ITestCaseDataPayload } from "../_interface/test-case-data";
import {
  genericDelete,
  genericGet,
  genericPost,
  genericPostFormData,
  genericPut,
} from "./generic-api-methods";

export const addTestCaseDataService = async (
  projectId: string,
  testCaseId: string,
  body: ITestCaseDataPayload
): Promise<any> => {
  try {
    const formData = new FormData();

    body.testCases?.forEach((testCase, index) => {
      formData.append(`testCases[${index}][name]`, testCase.name);
      formData.append(`testCases[${index}][type]`, testCase.type);
      formData.append(`testCases[${index}][inputValue]`, testCase.inputValue);
      formData.append(`testCases[${index}][description]`, testCase.description);

      if (testCase?.validation && Array.isArray(testCase.validation)) {
        testCase.validation.forEach((val) => {
          formData.append(`testCases[${index}][validation][]`, val);
        });
      }

      if (testCase?.attachments && Array.isArray(testCase.attachments)) {
        testCase.attachments.forEach((file) => {
          formData.append(`testCases[${index}][attachments]`, file);
        });
      }
    });
    const response = await genericPostFormData(
      `${TEST_CASE_DATA_ENPOINT(projectId, testCaseId)}`,
      formData
    );
    return response || {};
  } catch (error) {
    console.error(`Error > addTestCaseDataService:`, error);
    throw error;
  }
};

export const getTestCaseDataService = async (
  projectId: string,
  testCaseId: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${TEST_CASE_DATA_ENPOINT(projectId, testCaseId)}`
    );
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
    const response = await genericDelete(
      `${TEST_CASE_DATA_ENPOINT(projectId, testCaseId)}/${testCaseDataId}`
    );
    return response || {};
  } catch (error) {
    console.error(`Error > deleteTestCaseDataService:`, error);
    throw error;
  }
};

export const updateTestCaseDataService = async (
  projectId: string,
  testCaseId: string,
  testCaseDataId: string,
  body: ITestCaseDataPayload
): Promise<any> => {
  try {
    const response = await genericPut(
      `${TEST_CASE_DATA_ENPOINT(projectId, testCaseId)}/${testCaseDataId}`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > updateTestCaseDataService:`, error);
    throw error;
  }
};

export const deleteTestCaseDataAttachmentService = async (
  projectId: string,
  testCaseId: string,
  testCaseDataId: string,
  attachmentId: string
): Promise<any> => {
  try {
    const response = await genericDelete(
      `${TEST_CASE_DATA_ENPOINT(
        projectId,
        testCaseId
      )}/${testCaseDataId}/attachment/${attachmentId}`
    );
    return response || {};
  } catch (error) {
    console.error(`Error > deleteTestCaseDataAttachmentService:`, error);
    throw error;
  }
};

export const getTestCaseDataAttachmentsService = async (
  projectId: string,
  testCaseId: string,
  testCaseDataId: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${TEST_CASE_DATA_ENPOINT(
        projectId,
        testCaseId
      )}/${testCaseDataId}/attachment`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getTestCaseDataAttachmentsService:`, error);
    throw error;
  }
};

export const addTestCaseDataAttachmentsService = async (
  projectId: string,
  testCaseId: string,
  testCaseDataId: string,
  body: any
): Promise<any> => {
  try {
    const formData = new FormData();
    body?.attachments?.forEach((file: any) => {
      formData.append("attachments", file);
    });

    const response = await genericPostFormData(
      `${TEST_CASE_DATA_ENPOINT(
        projectId,
        testCaseId
      )}/${testCaseDataId}/attachment`,
      formData
    );
    return response || {};
  } catch (error) {
    console.error(`Error > addTestCaseDataAttachmentsService:`, error);
    throw error;
  }
};

export const getSingleTestCaseDataAttachmentsService = async (
  projectId: string,
  testCaseId: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${PROJECTS_ENDPOINT}/${projectId}/test-case/${testCaseId}/test-case-data/attachment`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getTestCaseDataAttachmentsService:`, error);
    throw error;
  }
};
