import {
  COMMENT_ENDPOINT,
  PAGINATION_QUERY_ENDPOINT,
} from "../_constants/api-endpoints";
import { ICommentPayload } from "../_interface/comment";
import {
  genericDelete,
  genericGet,
  genericPost,
  genericPut,
} from "./generic-api-methods";

export const getCommentsService = async (
  projectId: string,
  issueId: string,
  pageSize: Number
): Promise<any> => {
  try {
    const response = await genericGet(
      `${COMMENT_ENDPOINT(projectId, issueId)}?limit=${pageSize}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getCommentsService:`, error);
    throw error;
  }
};

export const addCommentService = async (
  projectId: string,
  issueId: string,
  body: ICommentPayload
): Promise<any> => {
  try {
    const response = await genericPost(
      COMMENT_ENDPOINT(projectId, issueId),
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > addCommentService:`, error);
    throw error;
  }
};

export const deleteCommentService = async (
  projectId: string,
  issueId: string,
  id: string
): Promise<any> => {
  try {
    const response = await genericDelete(
      `${COMMENT_ENDPOINT(projectId, issueId)}/${id}`
    );
    return response || {};
  } catch (error) {
    console.error(`Error > deleteCommentService:`, error);
    throw error;
  }
};

export const updateCommentService = async (
  id: string,
  projectId: string,
  issueId: string,
  body: ICommentPayload
): Promise<any> => {
  try {
    const response = await genericPut(
      `${COMMENT_ENDPOINT(projectId, issueId)}/${id}`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > updateCommentService:`, error);
    throw error;
  }
};
