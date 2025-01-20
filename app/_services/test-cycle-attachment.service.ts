import { PROJECTS_ENDPOINT } from "../_constants/api-endpoints";
import {
  genericDelete,
  genericGet,
  genericPostFormData,
} from "./generic-api-methods";

export const addTestCycleAttachmentsService = async (
  projectId: string,
  testCycleId: string,
  body: any
): Promise<any> => {
  try {
    const formData = new FormData();
    body?.attachments?.forEach((file: any) => {
      formData.append("attachments", file);
    });

    const response = await genericPostFormData(
      `${PROJECTS_ENDPOINT}/${projectId}/test-cycle/${testCycleId}/attachment`,
      formData
    );
    return response || {};
  } catch (error) {
    console.error(`Error > addTestCycleAttachmentsService:`, error);
    throw error;
  }
};

export const getTestCycleAttachmentsService = async (
  projectId: string,
  testCycleId: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${PROJECTS_ENDPOINT}/${projectId}/test-cycle/${testCycleId}/attachment`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getTestCycleAttachmentsService:`, error);
    throw error;
  }
};

export const deleteTestCycleAttachmentService = async (
  projectId: string,
  testCycleId: string,
  attachmentId: string
): Promise<any> => {
  try {
    const response = await genericDelete(
      `${PROJECTS_ENDPOINT}/${projectId}/test-cycle/${testCycleId}/attachment/${attachmentId}`
    );
    return response || {};
  } catch (error) {
    console.error(`Error > deleteTestCycleAttachmentService:`, error);
    throw error;
  }
};
