import {
  PAGINATION_QUERY_ENDPOINT,
  PROJECT_REQUIREMENT_ENPOINT,
} from "../_constants/api-endpoints";
import { IRequirementPayload } from "../_interface/requirement";
import {
  genericDelete,
  genericGet,
  genericPostFormData,
  genericPut,
} from "./generic-api-methods";

export const addRequirementService = async (
  projectId: string,
  body: IRequirementPayload
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("title", body?.title);
    formData.append("description", body?.description || "");
    formData.append("projectId", body?.projectId || "");
    formData.append("status", body?.status || "");
    formData.append("assignedTo", body?.assignedTo || "");
    body?.attachments?.forEach((file) => {
      formData.append("attachments", file);
    });
    const response = await genericPostFormData(
      PROJECT_REQUIREMENT_ENPOINT(projectId),
      formData
    );
    return response || {};
  } catch (error) {
    console.error(`Error > addRequirementService:`, error);
    throw error;
  }
};

export const getRequirementsService = async (
  projectId: string,
  index: Number,
  pageSize: Number,
  globalFilter: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${PROJECT_REQUIREMENT_ENPOINT(projectId)}${PAGINATION_QUERY_ENDPOINT(
        index,
        pageSize
      )}&searchString=${globalFilter}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getRequirementsService:`, error);
    throw error;
  }
};

export const deleteRequirementService = async (
  projectId: string,
  requirementId: string
): Promise<any> => {
  try {
    const response = await genericDelete(
      `${PROJECT_REQUIREMENT_ENPOINT(projectId)}/${requirementId}`
    );
    return response || {};
  } catch (error) {
    console.error(`Error > deleteRequirementService:`, error);
    throw error;
  }
};

export const updateRequirementService = async (
  projectId: string,
  requirementId: string,
  body: IRequirementPayload
): Promise<any> => {
  try {
    const response = await genericPut(
      `${PROJECT_REQUIREMENT_ENPOINT(projectId)}/${requirementId}`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > updateRequirementService:`, error);
    throw error;
  }
};

export const getRequirementService = async (
  projectId: string,
  requirementId: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${PROJECT_REQUIREMENT_ENPOINT(projectId)}/${requirementId}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getRequirementService:`, error);
    throw error;
  }
};

export const getRequirementsWithoutPaginationService = async (
  projectId: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${PROJECT_REQUIREMENT_ENPOINT(projectId)}/without-pagination`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getRequirementsWithoutPaginationService:`, error);
    throw error;
  }
};
