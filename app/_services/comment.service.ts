import { COMMENT_ENDPOINT } from "../_constants/api-endpoints";
import { ICommentPayload, ICommentVerifyPayload } from "../_interface/comment";
import {
  genericDelete,
  genericGet,
  genericPatch,
  genericPost,
  genericPut,
} from "./generic-api-methods";

export const getCommentsService = async (
  projectId: string,
  entityName: string,
  entityId: string,
  pageSize: Number
): Promise<any> => {
  try {
    const response = await genericGet(
      `${COMMENT_ENDPOINT(projectId, entityName, entityId)}?limit=${pageSize}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getCommentsService:`, error);
    throw error;
  }
};

export const addCommentService = async (
  projectId: string,
  entityName: string,
  entityId: string,
  body: ICommentPayload
): Promise<any> => {
  try {
    const response = await genericPost(
      COMMENT_ENDPOINT(projectId, entityName, entityId),
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
  entityName: string,
  entityId: string,
  id: string
): Promise<any> => {
  try {
    const response = await genericDelete(
      `${COMMENT_ENDPOINT(projectId, entityName, entityId)}/${id}`
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
  entityName: string,
  entityId: string,
  body: ICommentPayload
): Promise<any> => {
  try {
    const response = await genericPut(
      `${COMMENT_ENDPOINT(projectId, entityName, entityId)}/${id}`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > updateCommentService:`, error);
    throw error;
  }
};

export const verifyCommentService = async (
  id: string,
  projectId: string,
  entityName: string,
  entityId: string,
  body: ICommentVerifyPayload
): Promise<any> => {
  try {
    const response = await genericPatch(
      `${COMMENT_ENDPOINT(projectId, entityName, entityId)}/${id}/verify`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > verifyCommentService:`, error);
    throw error;
  }
};
