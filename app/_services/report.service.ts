import {
  REPORT_ENPOINT,
  PAGINATION_QUERY_ENDPOINT,
} from "../_constants/api-endpoints";
import { IReportPayload } from "../_interface/report";
import {
  genericDelete,
  genericGet,
  genericPostFormData,
  genericPut,
} from "./generic-api-methods";

export const addReportService = async (
  projectId: string,
  body: IReportPayload
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("title", body?.title);
    formData.append("description", body?.description);
    body?.attachments?.forEach((file) => {
      formData.append("attachments", file);
    });
    const response = await genericPostFormData(
      `${REPORT_ENPOINT(projectId)}`,
      formData
    );
    return response || {};
  } catch (error) {
    console.error(`Error > addReportService:`, error);
    throw error;
  }
};

export const getReportsService = async (
  projectId: string,
  index: Number,
  pageSize: Number,
  searchString?: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${REPORT_ENPOINT(projectId)}${PAGINATION_QUERY_ENDPOINT(
        index,
        pageSize
      )}&searchString=${searchString}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getReportsService:`, error);
    throw error;
  }
};

export const deleteReportService = async (
  projectId: string,
  noteId: string
): Promise<any> => {
  try {
    const response = await genericDelete(
      `${REPORT_ENPOINT(projectId)}/${noteId}`
    );
    return response || {};
  } catch (error) {
    console.error(`Error > deleteReportService:`, error);
    throw error;
  }
};

export const updateReportService = async (
  projectId: string,
  noteId: string,
  body: IReportPayload
): Promise<any> => {
  try {
    const response = await genericPut(
      `${REPORT_ENPOINT(projectId)}/${noteId}`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > updateReportService:`, error);
    throw error;
  }
};
