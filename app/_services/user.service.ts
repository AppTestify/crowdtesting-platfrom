import { string } from "zod";
import { IPaymentPayload } from "../(routes)/private/profile/_components/payment";
import {
  GET_USER_ENDPOINT,
  GET_USER_ENPOINT,
  PAGINATION_QUERY_ENDPOINT,
  PAYMENT_ENDPOINT,
  PROFILE_PICTURE_ENDPOINT,
  PROJECT_CLIENT_USER_ENPOINT,
  PROJECT_USER_ENPOINT,
  PROJECTS_ENDPOINT,
  USER_PASSWORD_ENDPOINT,
  USERS_BULK_DELETE_ENDPOINT,
  USERS_ENDPOINT,
  CLIENT_USERS_ENDPOINT,
  CLIENT_USER_ASSIGN_ENDPOINT,
} from "../_constants/api-endpoints";
import {
  IUserByAdmin,
  IUserPassword,
  IUsersBulkDeletePayload,
  IVerifyUser,
} from "../_interface/user";
import { IUser } from "../_models/user.model";
import {
  genericDelete,
  genericGet,
  genericPatch,
  genericPost,
  genericPostFormData,
  genericPut,
} from "./generic-api-methods";

export const getUserByEmailService = async (email: string): Promise<any> => {
  try {
    const response = await genericGet(
      GET_USER_ENDPOINT(email),
      process.env.URL
    );

    return response || {};
  } catch (error) {
    console.error(`Error > getUserByEmailService:`, error);
    throw error;
  }
};

export const uploadProfilePictureService = async (file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("profilePicture", file);

    const response = await genericPostFormData(
      PROFILE_PICTURE_ENDPOINT,
      formData
    );
    return response || {};
  } catch (error) {
    console.error(`Error > uploadProfilePictureService:`, error);
    throw error;
  }
};

export const deleteProfilePictureService = async (): Promise<any> => {
  try {
    const response = await genericDelete(PROFILE_PICTURE_ENDPOINT);
    return response || {};
  } catch (error) {
    console.error(`Error > deleteProfilePictureService:`, error);
    throw error;
  }
};

export const getProfilePictureService = async (): Promise<any> => {
  try {
    const response = await genericGet(PROFILE_PICTURE_ENDPOINT);
    return response || {};
  } catch (error) {
    console.error(`Error > getProfilePictureService:`, error);
    throw error;
  }
};

export const updatePaymentService = async (
  payment: IPaymentPayload
): Promise<any> => {
  try {
    const response = await genericPost(PAYMENT_ENDPOINT, payment);
    return response || {};
  } catch (error) {
    console.error(`Error > updatePaymentService:`, error);
    throw error;
  }
};

export const getUsersService = async (
  index: Number,
  pageSize: Number,
  role: string,
  status: boolean | any,
  searchString?: string
): Promise<any> => {
  try {
    const response =
      await genericGet(`${USERS_ENDPOINT}${PAGINATION_QUERY_ENDPOINT(
        index,
        pageSize
      )}
    &role=${role}&status=${status}&searchString=${searchString}`);
    return response || [];
  } catch (error) {
    console.error(`Error > getUsersService:`, error);
    throw error;
  }
};

export const addUserService = async (body: IUserByAdmin): Promise<any> => {
  try {
    const response = await genericPost(USERS_ENDPOINT, body);
    return response || {};
  } catch (error) {
    console.error(`Error > addUserService:`, error);
    throw error;
  }
};

export const addClientUserService = async (
  users: IUserByAdmin[],
  projectId: string
): Promise<any> => {
  try {
    const response = await genericPost(
      `${PROJECT_CLIENT_USER_ENPOINT(projectId)}`,
      {
        projectId,
        users,
      }
    );
    return response || {};
  } catch (error) {
    console.error(`Error > addClientUserService:`, error);
    throw error;
  }
};

export const getClientUsersService = async (
  pageIndex: number = 1,
  pageSize: number = 10,
  role?: string,
  status?: string,
  searchString?: string
): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (role) params.append("role", role);
    if (status) params.append("status", status);
    if (searchString) params.append("searchString", searchString);
    if (pageIndex) params.append("page", pageIndex.toString());
    if (pageSize) params.append("limit", pageSize.toString());

    const response = await genericGet(`${CLIENT_USERS_ENDPOINT}?${params.toString()}`);
    return response || {};
  } catch (error) {
    console.error(`Error > getClientUsersService:`, error);
    throw error;
  }
};

export const assignClientUserToProjectService = async (
  projectId: string,
  userId: string,
  role: string
): Promise<any> => {
  try {
    const response = await genericPost(
      CLIENT_USER_ASSIGN_ENDPOINT(projectId),
      {
        projectId,
        userId,
        role,
      }
    );
    return response || {};
  } catch (error) {
    console.error(`Error > assignClientUserToProjectService:`, error);
    throw error;
  }
};

export const deleteUserService = async (userId: string): Promise<any> => {
  try {
    const response = await genericDelete(`${GET_USER_ENPOINT(userId)}`);
    return response || {};
  } catch (error) {
    console.error(`Error > deleteUserService:`, error);
    throw error;
  }
};

export const updateUserService = async (
  userId: string,
  body: IUserByAdmin
): Promise<any> => {
  try {
    const response = await genericPut(`${GET_USER_ENPOINT(userId)}`, body);
    return response || {};
  } catch (error) {
    console.error(`Error > updateUserService:`, error);
    throw error;
  }
};

export const usersBulkDeleteService = async (
  body: IUsersBulkDeletePayload
): Promise<any> => {
  try {
    const response = await genericPost(USERS_BULK_DELETE_ENDPOINT, body);
    return response || {};
  } catch (error) {
    console.error(`Error > usersBulkDeleteService:`, error);
    throw error;
  }
};

export const updateUserStausService = async (
  userId: string,
  isActive: boolean
): Promise<any> => {
  try {
    const response = await genericPut(`${GET_USER_ENPOINT(userId)}/status`, {
      isActive,
    });
    return response || {};
  } catch (error) {
    console.error(`Error > updateuserStatusService:`, error);
    throw error;
  }
};

export const sendUserCredentialsService = async (
  userId: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${GET_USER_ENPOINT(userId)}/send-credentials`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > sendUserCredentialsService:`, error);
    throw error;
  }
};

export const getUserService = async (userId: string): Promise<any> => {
  try {
    const response = await genericGet(`${GET_USER_ENPOINT(userId)}`);
    return response || [];
  } catch (error) {
    console.error(`Error > getUserService:`, error);
    throw error;
  }
};

export const updatePasswordService = async (
  body: IUserPassword
): Promise<any> => {
  try {
    const response = await genericPut(USER_PASSWORD_ENDPOINT, body);
    return response || {};
  } catch (error) {
    console.error(`Error > updatePassword:`, error);
    throw error;
  }
};

export const getUsersWithoutPaginationService = async (
  projectId: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${PROJECTS_ENDPOINT}/${projectId}/unique-users`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getUsersWithoutPaginationService:`, error);
    throw error;
  }
};

export const getAllUsersService = async (): Promise<any> => {
  try {
    const response = await genericGet(`${USERS_ENDPOINT}/without-pagination`);
    return response || [];
  } catch (error) {
    console.error(`Error > getAllUsersService:`, error);
    throw error;
  }
};

export const getAllTesterUsersService = async (): Promise<any> => {
  try {
    const response = await genericGet(`${USERS_ENDPOINT}/testers/list`);
    return response || [];
  } catch (error) {
    console.error(`Error > getAllTesterUsersService:`, error);
    throw error;
  }
};

export const verifyUserService = async (
  projectId: string,
  userId: string,
  body: IVerifyUser
): Promise<any> => {
  try {
    const response = await genericPatch(
      `${PROJECT_USER_ENPOINT(projectId)}/${userId}/verify`,
      body
    );
    return response || {};
  } catch (error) {
    console.error(`Error > verifyUserService:`, error);
    throw error;
  }
};
