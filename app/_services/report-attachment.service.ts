import { PROJECTS_ENDPOINT } from "../_constants/api-endpoints";
import {
  genericDelete,
  genericGet,
  genericPostFormData,
} from "./generic-api-methods";

export const addReportAttachmentsService = async (
  projectId: string,
  reportId: string,
  body: any
): Promise<any> => {
  try {
    const formData = new FormData();
    body?.attachments?.forEach((file: any) => {
      formData.append("attachments", file);
    });

    const response = await genericPostFormData(
      `${PROJECTS_ENDPOINT}/${projectId}/report/${reportId}/attachment`,
      formData
    );
    return response || {};
  } catch (error) {
    console.error(`Error > addReportAttachmentsService:`, error);
    throw error;
  }
};

export const getReportAttachmentsService = async (
  projectId: string,
  reportId: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${PROJECTS_ENDPOINT}/${projectId}/report/${reportId}/attachment`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getReportAttachmentsService:`, error);
    throw error;
  }
};

export const deleteReportAttachmentService = async (
  projectId: string,
  reportId: string,
  attachmentId: string
): Promise<any> => {
  try {
    const response = await genericDelete(
      `${PROJECTS_ENDPOINT}/${projectId}/report/${reportId}/attachment/${attachmentId}`
    );
    return response || {};
  } catch (error) {
    console.error(`Error > deleteReportAttachmentService:`, error);
    throw error;
  }
};
