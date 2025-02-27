import {
  PAGINATION_QUERY_ENDPOINT,
  TEST_CYCLE_ENPOINT,
} from "../_constants/api-endpoints";
import {
  IAssignedTestCase,
  ITestCyclePayload,
  ITestCycleVerificationPayload,
  IUnAssignedTestCase,
} from "../_interface/test-cycle";
import {
  genericDelete,
  genericGet,
  genericPatch,
  genericPost,
  genericPostFormData,
  genericPut,
} from "./generic-api-methods";

export const getTestCycleService = async (
  projectId: string,
  index: Number,
  pageSize: Number,
  searchString?: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${TEST_CYCLE_ENPOINT(projectId)}${PAGINATION_QUERY_ENDPOINT(
        index,
        pageSize
      )}&searchString=${searchString}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getTestCycleService:`, error);
    throw error;
  }
};

export const addTestCycleService = async (
  projectId: string,
  body: ITestCyclePayload
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("title", body?.title);
    formData.append("projectId", projectId);
    formData.append("description", body?.description);
    formData.append("startDate", body?.startDate.toISOString());
    formData.append("endDate", body?.endDate.toISOString());
    formData.append("country", body?.country);
    formData.append("emailFormat", body?.emailFormat);
    formData.append("emailSubject", body?.emailSubject || "");
    formData.append("isEmailSend", (body?.isEmailSend ?? false).toString());
    body?.attachments?.forEach((file) => {
      formData.append("attachments", file);
    });

    const response = await genericPostFormData(
      `${TEST_CYCLE_ENPOINT(projectId)}`,
      formData
    );
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
    const response = await genericDelete(
      `${TEST_CYCLE_ENPOINT(projectId)}/${testCycleId}`
    );
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
    const response = await genericPut(
      `${TEST_CYCLE_ENPOINT(projectId)}/${testCycleId}`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > updateTestCycleService:`, error);
    throw error;
  }
};

export const assignTestCase = async (
  projectId: string,
  testCycleId: string,
  body: IAssignedTestCase
): Promise<any> => {
  try {
    const response = await genericPatch(
      `${TEST_CYCLE_ENPOINT(projectId)}/${testCycleId}/assign-test-cases`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > assignTestCase:`, error);
    throw error;
  }
};

export const unAssignTestCase = async (
  projectId: string,
  testCycleId: string,
  body: IUnAssignedTestCase
): Promise<any> => {
  try {
    const response = await genericPatch(
      `${TEST_CYCLE_ENPOINT(projectId)}/${testCycleId}/un-assign-test-cases`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > unAssignTestCase:`, error);
    throw error;
  }
};

export const getAssignTestCaseService = async (
  projectId: string,
  testCaseId: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${TEST_CYCLE_ENPOINT(projectId)}/${testCaseId}/assign-test-cases`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getAssignTestCaseService:`, error);
    throw error;
  }
};

export const getTestCycleListService = async (
  projectId: string
): Promise<any> => {
  try {
    const response = await genericGet(`${TEST_CYCLE_ENPOINT(projectId)}/list`);
    return response || [];
  } catch (error) {
    console.error(`Error > getTestCycleListService:`, error);
    throw error;
  }
};

export const getTestCycleWithoutPaginationService = async (
  projectId: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${TEST_CYCLE_ENPOINT(projectId)}/without-pagination`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getTestCycleWithoutPaginationService:`, error);
    throw error;
  }
};

export const getSingleCycleService = async (
  projectId: string,
  testCycleId: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${TEST_CYCLE_ENPOINT(projectId)}/${testCycleId}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getSingleCycleService:`, error);
    throw error;
  }
};

export const verifyTestCycleService = async (
  body: ITestCycleVerificationPayload
): Promise<any> => {
  try {
    const response = await genericPost(`/api/auth/test-cycle/verify`, body);
    return response || [];
  } catch (error) {
    console.error(`Error > verifyTestCycleService:`, error);
    throw error;
  }
};

export const getTestCycleEmailFormatService = async (
  projectId: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${TEST_CYCLE_ENPOINT(projectId)}/mailFormat`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getTestCycleEmailFormatService:`, error);
    throw error;
  }
};
