import {
  PAGINATION_QUERY_ENDPOINT,
  PROJECT_USER_ENPOINT,
  PROJECTS_BULK_DELETE_ENDPOINT,
  PROJECTS_ENDPOINT,
} from "../_constants/api-endpoints";
import {
  IProject,
  IProjectBulkDeletePayload,
  IProjectDescription,
  IProjectPayload,
  IProjectUser,
} from "../_interface/project";
import {
  genericDelete,
  genericGet,
  genericPatch,
  genericPost,
  genericPut,
} from "./generic-api-methods";

export const getProjectsService = async (
  index: Number,
  pageSize: Number,
  searchString?: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${PROJECTS_ENDPOINT}${PAGINATION_QUERY_ENDPOINT(
        index,
        pageSize
      )}&searchString=${searchString}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getProjects:`, error);
    throw error;
  }
};

export const addProjectService = async (
  body: IProjectPayload
): Promise<any> => {
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
    const response = await genericPut(`${PROJECTS_ENDPOINT}/${id}/status`, {
      isActive,
    });
    return response || {};
  } catch (error) {
    console.error(`Error > updateProjectStatusService:`, error);
    throw error;
  }
};

export const getProjectService = async (projectId: string): Promise<any> => {
  try {
    const response = await genericGet(`${PROJECTS_ENDPOINT}/${projectId}`);
    return response || [];
  } catch (error) {
    console.error(`Error > getProjectService:`, error);
    throw error;
  }
};

export const getProjectUsersService = async (
  projectId: string
): Promise<any> => {
  try {
    const response = await genericGet(`${PROJECT_USER_ENPOINT(projectId)}`);
    return response || [];
  } catch (error) {
    console.error(`Error > getProjectUsersService:`, error);
    throw error;
  }
};

export const addProjectUserService = async (
  projectId: string,
  body: IProjectUser
): Promise<any> => {
  try {
    const response = await genericPost(
      `${PROJECT_USER_ENPOINT(projectId)}`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > addProjectUserService:`, error);
    throw error;
  }
};

export const deleteProjectUserService = async (
  projectId: string,
  userId: string
): Promise<any> => {
  try {
    const response = await genericDelete(
      `${PROJECT_USER_ENPOINT(projectId)}/${userId}`
    );
    return response || {};
  } catch (error) {
    console.error(`Error > deleteProjectUserService:`, error);
    throw error;
  }
};

export const editProjectUserService = async (
  projectId: string,
  body: IProjectUser
): Promise<any> => {
  try {
    const response = await genericPut(
      `${PROJECT_USER_ENPOINT(projectId)}`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > editProjectUserService:`, error);
    throw error;
  }
};

export const getProjectsWithoutPaginationService = async (): Promise<any> => {
  try {
    const response = await genericGet(
      `${PROJECTS_ENDPOINT}/without-pagination`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getProjectUsersService:`, error);
    throw error;
  }
};

export const editProjectDescriptionService = async (
  projectId: string,
  body: IProjectDescription
): Promise<any> => {
  try {
    const response = await genericPatch(
      `${PROJECTS_ENDPOINT}/${projectId}/description`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > editProjectDescriptionService:`, error);
    throw error;
  }
};
