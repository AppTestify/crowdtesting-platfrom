import {
  GET_ISSUE_ENPOINT,
  GET_ISSUES_ENPOINT,
  ISSUES_ENDPOINT,
} from "../_constants/api-endpoints";
import { IIssuePayload } from "../_interface/issue";
import {
  genericDelete,
  genericGet,
  genericPost,
  genericPostFormData,
  genericPut,
} from "./generic-api-methods";

export const getIssuesService = async (projectId: string): Promise<any> => {
  try {
    const response = await genericGet(GET_ISSUES_ENPOINT(projectId));
    return response || [];
  } catch (error) {
    console.error(`Error > getIssues:`, error);
    throw error;
  }
};

export const addIssueService = async (
  projectId: string,
  body: IIssuePayload
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("title", body?.title);
    formData.append("severity", body?.severity);
    formData.append("priority", body?.priority);
    formData.append("description", body?.description || "");
    formData.append("status", body?.status || "");
    formData.append("projectId", body?.projectId || "");
    if (body?.device && Array.isArray(body.device)) {
      body.device.forEach((device) => {
        formData.append("device[]", device);
      });
    }
    body?.attachments?.forEach((file) => {
      formData.append("attachments", file);
    });
    const response = await genericPostFormData(GET_ISSUES_ENPOINT(projectId), formData);
    return response || {};
  } catch (error) {
    console.error(`Error > addIssueService:`, error);
    throw error;
  }
};

export const deleteIssueService = async (
  projectId: string,
  id: string
): Promise<any> => {
  try {
    const response = await genericDelete(
      `${GET_ISSUES_ENPOINT(projectId)}/${id}`
    );
    return response || {};
  } catch (error) {
    console.error(`Error > deleteIssueService:`, error);
    throw error;
  }
};

export const updateIssueService = async (
  projectId: string,
  id: string,
  body: IIssuePayload
): Promise<any> => {
  try {
    const response = await genericPut(
      `${GET_ISSUES_ENPOINT(projectId)}/${id}`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > updateIssueService:`, error);
    throw error;
  }
};

export const getIssueService = async (projectId: string, issueId: string): Promise<any> => {
  try {
    const response = await genericGet(GET_ISSUE_ENPOINT(projectId, issueId));
    return response || [];
  } catch (error) {
    console.error(`Error > getIssue:`, error);
    throw error;
  }
};