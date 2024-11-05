import { IPaymentPayload } from "../(routes)/private/profile/_components/payment";
import {
  GET_USER_ENDPOINT,
  PAYMENT_ENDPOINT,
  PROFILE_PICTURE_ENDPOINT,
  USERS_ENDPOINT,
} from "../_constants/api-endpoints";
import { IUserByAdmin } from "../_interface/user";
import {
  genericDelete,
  genericGet,
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

export const getUsersService = async (index: Number, pageSize: Number): Promise<any> => {
  try {
    const response = await genericGet(`${USERS_ENDPOINT}?page=${index}&limit=${pageSize}`);
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

export const deleteUserService = async (userId: string): Promise<any> => {
  try {
    const response = await genericDelete(`${USERS_ENDPOINT}/id/${userId}`);
    return response || {};
  } catch (error) {
    console.error(`Error > deleteUserService:`, error);
    throw error;
  }
};

export const updateUserService = async (userId: string | undefined, body: IUserByAdmin): Promise<any> => {
  try {
    const response = await genericPut(`${USERS_ENDPOINT}/id/${userId}`, body);
    return response || {};
  } catch (error) {
    console.error(`Error > updateUserService:`, error);
    throw error;
  }
};