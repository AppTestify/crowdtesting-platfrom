import {
  GET_ISSUES_ENPOINT,
  ISSUES_ENDPOINT,
} from "../_constants/api-endpoints";
import { IIssuePayload } from "../_interface/issue";
import {
  genericDelete,
  genericGet,
  genericPost,
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
    const response = await genericPost(GET_ISSUES_ENPOINT(projectId), body);
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
