import {
  GET_ISSUE_ENPOINT,
  GET_TASK_ENPOINT,
  PAGINATION_QUERY_ENDPOINT,
} from "../_constants/api-endpoints";
import { IIssueStatusPayload } from "../_interface/issue";
import { ITaskPayload, ITaskStatusPayload } from "../_interface/task";
import {
  genericDelete,
  genericGet,
  genericPatch,
  genericPost,
  genericPut,
} from "./generic-api-methods";

export const getTaskService = async (
  projectId: string,
  index: Number,
  pageSize: Number,
  searchString?: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${GET_TASK_ENPOINT(projectId)}${PAGINATION_QUERY_ENDPOINT(
        index,
        pageSize
      )}&searchString=${searchString}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getTaskService:`, error);
    throw error;
  }
};

export const addTaskService = async (
  projectId: string,
  body: ITaskPayload
): Promise<any> => {
  try {
    const response = await genericPost(GET_TASK_ENPOINT(projectId), body);
    return response || {};
  } catch (error) {
    console.error(`Error > addTaskService:`, error);
    throw error;
  }
};

export const deleteTaskService = async (
  projectId: string,
  taskId: string
): Promise<any> => {
  try {
    const response = await genericDelete(
      `${GET_TASK_ENPOINT(projectId)}/${taskId}`
    );
    return response || {};
  } catch (error) {
    console.error(`Error > deleteTaskService:`, error);
    throw error;
  }
};

export const updateTaskService = async (
  projectId: string,
  taskId: string,
  body: ITaskPayload
): Promise<any> => {
  try {
    const response = await genericPut(
      `${GET_TASK_ENPOINT(projectId)}/${taskId}`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > updateTaskService:`, error);
    throw error;
  }
};

export const updateTaskStatusService = async (
  projectId: string,
  taskId: string,
  body: ITaskStatusPayload
): Promise<any> => {
  try {
    const response = await genericPatch(
      `${GET_TASK_ENPOINT(projectId)}/${taskId}/status`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > updateTaskStatusService:`, error);
    throw error;
  }
};
