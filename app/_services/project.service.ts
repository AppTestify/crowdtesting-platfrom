import { PAGINATION_QUERY_ENDPOINT, PROJECTS_BULK_DELETE_ENDPOINT, PROJECTS_ENDPOINT } from "../_constants/api-endpoints";
import { IProject, IProjectBulkDeletePayload, IProjectPayload } from "../_interface/project";
import { genericDelete, genericGet, genericPost, genericPut } from "./generic-api-methods";



export const getProjectsService = async (index: Number, pageSize: Number): Promise<any> => {
  try {
    const response = await genericGet(`${PROJECTS_ENDPOINT}${PAGINATION_QUERY_ENDPOINT(index, pageSize)}`);
    return response || [];
  } catch (error) {
    console.error(`Error > getProjects:`, error);
    throw error;
  }
};

export const addProjectService = async (body: IProjectPayload): Promise<any> => {
  try {
    const response = await genericPost(PROJECTS_ENDPOINT, body);
    return response || {};
  } catch (error) {
    console.error(`Error > addProjectService:`, error);
    throw error;
  }
};

export const deleteProjectService = async (id: string): Promise<any> => {
  try {
    const response = await genericDelete(`${PROJECTS_ENDPOINT}/${id}`);
    return response || {};
  } catch (error) {
    console.error(`Error > deleteProjectService:`, error);
    throw error;
  }
};



export const projectsBulkDeleteService = async (
  body: IProjectBulkDeletePayload
): Promise<any> => {
  try {
    const response = await genericPost(PROJECTS_BULK_DELETE_ENDPOINT, body);
    return response || {};
  } catch (error) {
    console.error(`Error > bulkDeleteProjectService:`, error);
    throw error;
  }
};

export const updateProjectService = async (
  id: string,
  body: IProject
): Promise<any> => {
  try {
    const response = await genericPut(`${PROJECTS_ENDPOINT}/${id}`, body);
    return response || {};
  } catch (error) {
    console.error(`Error > updateProjectService:`, error);
    throw error;
  }
};

export const updateProjectStausService = async (
  id: string,
  isActive: boolean
): Promise<any> => {
  try {
    const response = await genericPut(`${PROJECTS_ENDPOINT}/${id}/status`, { isActive });
    return response || {};
  } catch (error) {
    console.error(`Error > updateProjectStatusService:`, error);
    throw error;
  }
};

