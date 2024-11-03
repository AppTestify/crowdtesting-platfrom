import { IPaymentPayload } from "../(routes)/private/profile/_components/payment";
import {
  GET_USER_ENDPOINT,
  PAYMENT_ENDPOINT,
  PROFILE_PICTURE_ENDPOINT,
  SIGN_UP_ENDPOINT,
} from "../_constants/api-endpoints";
import {
  genericDelete,
  genericGet,
  genericPost,
  genericPostFormData,
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
