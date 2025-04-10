import {
  PAGINATION_QUERY_ENDPOINT,
  TEST_CASE_ENPOINT,
  TEST_CYCLE_ENPOINT,
} from "../_constants/api-endpoints";
import { ITestCasePayload } from "../_interface/test-case";
import {
  genericDelete,
  genericGet,
  genericPost,
  genericPostFormData,
  genericPut,
} from "./generic-api-methods";

export const getTestCaseService = async (
  projectId: string,
  index: Number,
  pageSize: Number,
  requirement: string,
  globalFilter: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${TEST_CASE_ENPOINT(projectId)}${PAGINATION_QUERY_ENDPOINT(
        index,
        pageSize
      )}&requirement=${requirement}&searchString=${globalFilter}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getTestCaseService:`, error);
    throw error;
  }
};

export const addTestCaseService = async (
  projectId: string,
  body: ITestCasePayload
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("title", body?.title);
    formData.append("testType", body?.testType || "");
    formData.append("severity", body?.severity || "");
    formData.append("projectId", projectId);
    formData.append("testSuite", body?.testSuite);
    formData.append("expectedResult", body?.expectedResult);
    if (body?.requirements && Array.isArray(body.requirements)) {
      body.requirements.forEach((requirements) => {
        formData.append("requirements[]", requirements);
      });
    }
    body?.attachments?.forEach((file) => {
      formData.append("attachments", file);
    });
    const response = await genericPostFormData(
      `${TEST_CASE_ENPOINT(projectId)}`,
      formData
    );
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
    const response = await genericDelete(
      `${TEST_CASE_ENPOINT(projectId)}/${testCaseId}`
    );
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
    const response = await genericPut(
      `${TEST_CASE_ENPOINT(projectId)}/${testSuiteId}`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > updateTestCaseService:`, error);
    throw error;
  }
};

export const getTestCaseWithoutPaginationService = async (
  projectId: string,
  testCycleId: string,
  index: Number,
  pageSize: Number
): Promise<any> => {
  try {
    const response = await genericGet(
      `${TEST_CYCLE_ENPOINT(
        projectId
      )}/${testCycleId}/without-pagination${PAGINATION_QUERY_ENDPOINT(
        index,
        pageSize
      )}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getTestCaseWithoutPaginationService:`, error);
    throw error;
  }
};

export const deleteTestCaseAttachmentService = async (
  projectId: string,
  testCaseId: string,
  attachmentId: string
): Promise<any> => {
  try {
    const response = await genericDelete(
      `${TEST_CASE_ENPOINT(projectId)}/${testCaseId}/attachment/${attachmentId}`
    );
    return response || {};
  } catch (error) {
    console.error(`Error > deleteTestCaseAttachmentService:`, error);
    throw error;
  }
};

export const getTestCaseAttachmentsService = async (
  projectId: string,
  testCaseId: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${TEST_CASE_ENPOINT(projectId)}/${testCaseId}/attachment`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getTestCaseAttachmentsService:`, error);
    throw error;
  }
};

export const addTestCaseAttachmentsService = async (
  projectId: string,
  testCaseId: string,
  body: any
): Promise<any> => {
  try {
    const formData = new FormData();
    body?.attachments?.forEach((file: any) => {
      formData.append("attachments", file);
    });

    const response = await genericPostFormData(
      `${TEST_CASE_ENPOINT(projectId)}/${testCaseId}/attachment`,
      formData
    );
    return response || {};
  } catch (error) {
    console.error(`Error > addTestCaseAttachmentsService:`, error);
    throw error;
  }
};
