import {
  MODERATE_ENDPOINT,
  PAGINATION_QUERY_ENDPOINT,
  TEST_EXECUTION_ENDPOINT,
} from "../_constants/api-endpoints";
import { ITestCaseResultPayload } from "../_interface/test-case-result";
import { ITestExecutionPayload } from "../_interface/test-execution";
import {
  genericDelete,
  genericGet,
  genericPost,
  genericPostFormData,
  genericPut,
} from "./generic-api-methods";

export const getTestExecutionsService = async (
  projectId: string,
  testExecutionId: string,
  index: Number,
  pageSize: Number,
  result: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${TEST_EXECUTION_ENDPOINT(
        projectId
      )}/${testExecutionId}${PAGINATION_QUERY_ENDPOINT(
        index,
        pageSize
      )}&result=${result}`
    );
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
    const formData = new FormData();
    formData.append("result", body?.result);
    formData.append("remarks", body?.remarks || "");
    formData.append("isIssue", (body?.isIssue || false).toString());
    formData.append("testCycle", body?.testCycle || "");
    body?.testSteps?.forEach((testStep) => {
      formData.append("testSteps[]", JSON.stringify(testStep));
    });
    body?.attachments?.forEach((file) => {
      formData.append("attachments", file);
    });
    const response = await genericPostFormData(
      `${MODERATE_ENDPOINT(projectId, testCaseExecutionId)}`,
      formData
    );
    return response || {};
  } catch (error) {
    console.error(`Error > testModerateService:`, error);
    throw error;
  }
};

export const addTestExecution = async (
  projectId: string,
  body: ITestExecutionPayload
): Promise<any> => {
  try {
    const response = await genericPost(
      `${TEST_EXECUTION_ENDPOINT(projectId)}`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > addTestExecution:`, error);
    throw error;
  }
};

export const getTestExecutionService = async (
  projectId: string,
  index: Number,
  pageSize: Number,
  result?: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${TEST_EXECUTION_ENDPOINT(projectId)}${PAGINATION_QUERY_ENDPOINT(
        index,
        pageSize
      )}&searchString=${result}`
    );
    return response || {};
  } catch (error) {
    console.error(`Error > getTestExecutionService:`, error);
    throw error;
  }
};

export const getTestExecutionWithoutPaginationService = async (
  projectId: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${TEST_EXECUTION_ENDPOINT(projectId)}/without-pagination`
    );
    return response || {};
  } catch (error) {
    console.error(`Error > getTestExecutionWithoutPaginationService:`, error);
    throw error;
  }
};

export const deleteTestExecutionsService = async (
  projectId: string,
  testExecutionId: string
): Promise<any> => {
  try {
    const response = await genericDelete(
      `${TEST_EXECUTION_ENDPOINT(projectId)}/${testExecutionId}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > deleteTestExecutionsService:`, error);
    throw error;
  }
};

export const getTestExecutionByIdService = async (
  projectId: string,
  testExecutionId: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${TEST_EXECUTION_ENDPOINT(projectId)}/${testExecutionId}/id`
    );
    return response || {};
  } catch (error) {
    console.error(`Error > getTestExecutionByIdService:`, error);
    throw error;
  }
};

export const getTestResultAttachmentsService = async (
  projectId: string,
  testExecutionId: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${MODERATE_ENDPOINT(projectId,testExecutionId)}/attachments`
    );
    return response || {};
  } catch (error) {
    console.error(`Error > getTestResultAttachmentsService:`, error);
    throw error;
  }
};
