import {
  GET_ISSUE_ENPOINT,
  GET_ISSUES_ENPOINT,
  PAGINATION_QUERY_ENDPOINT,
} from "../_constants/api-endpoints";
import {
  IIssueAttachmentDownloadPayload,
  IIssuePayload,
  IIssueStatusPayload,
} from "../_interface/issue";
import {
  genericDelete,
  genericGet,
  genericPatch,
  genericPost,
  genericPostFormData,
  genericPut,
} from "./generic-api-methods";

export const getIssuesService = async (
  projectId: string,
  index: Number,
  pageSize: Number
): Promise<any> => {
  try {
    const response = await genericGet(
      `${GET_ISSUES_ENPOINT(projectId)}${PAGINATION_QUERY_ENDPOINT(
        index,
        pageSize
      )}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getIssues:`, error);
    throw error;
  }
};

export const getIssuesWithoutPaginationService = async (
  projectId: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${GET_ISSUES_ENPOINT(projectId)}/without-pagination`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getIssuesWithoutPaginationService:`, error);
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
    formData.append("testCycle", body?.testCycle);
    formData.append("issueType", body?.issueType);
    formData.append("severity", body?.severity);
    formData.append("priority", body?.priority);
    formData.append("description", body?.description || "");
    formData.append("status", body?.status || "");
    formData.append("projectId", body?.projectId || "");
    formData.append("assignedTo", body?.assignedTo || "");
    if (body?.device && Array.isArray(body.device)) {
      body.device.forEach((device) => {
        formData.append("device[]", device);
      });
    }
    body?.attachments?.forEach((file) => {
      formData.append("attachments", file);
    });
    const response = await genericPostFormData(
      GET_ISSUES_ENPOINT(projectId),
      formData
    );
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

export const getIssueService = async (
  projectId: string,
  issueId: string
): Promise<any> => {
  try {
    const response = await genericGet(GET_ISSUE_ENPOINT(projectId, issueId));
    return response || [];
  } catch (error) {
    console.error(`Error > getIssue:`, error);
    throw error;
  }
};

export const updateIssueStatusService = async (
  projectId: string,
  issueId: string,
  body: IIssueStatusPayload
): Promise<any> => {
  try {
    const response = await genericPatch(
      `${GET_ISSUE_ENPOINT(projectId, issueId)}/status`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > updateIssueStatusService:`, error);
    throw error;
  }
};

export const downloadIssueAttachments = async (
  projectId: string,
  issueId: string,
  body: IIssueAttachmentDownloadPayload
): Promise<any> => {
  try {
    const response = await genericPost(
      `${GET_ISSUE_ENPOINT(projectId, issueId)}/download-attachments`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > downloadIssueAttachments:`, error);
    throw error;
  }
};
