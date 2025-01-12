import {
  DEVICES_BULK_DELETE_ENDPOINT,
  DEVICES_ENDPOINT,
  PAGINATION_QUERY_ENDPOINT,
} from "../_constants/api-endpoints";
import {
  IDevicePayload,
  IDevicesBulkDeletePayload,
} from "../_interface/device";
import {
  genericDelete,
  genericGet,
  genericPost,
  genericPut,
} from "./generic-api-methods";

export const getDevicesService = async (
  index: Number,
  pageSize: Number
): Promise<any> => {
  try {
    const response = await genericGet(
      `${DEVICES_ENDPOINT}${PAGINATION_QUERY_ENDPOINT(index, pageSize)}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getDevices:`, error);
    throw error;
  }
};

export const addDeviceService = async (body: IDevicePayload): Promise<any> => {
  try {
    const response = await genericPost(DEVICES_ENDPOINT, body);
    return response || {};
  } catch (error) {
    console.error(`Error > addDeviceService:`, error);
    throw error;
  }
};

export const updateDeviceService = async (
  id: string,
  body: IDevicePayload
): Promise<any> => {
  try {
    const response = await genericPut(`${DEVICES_ENDPOINT}/${id}`, body);
    return response || {};
  } catch (error) {
    console.error(`Error > updateDeviceService:`, error);
    throw error;
  }
};

export const deleteDeviceService = async (id: string): Promise<any> => {
  try {
    const response = await genericDelete(`${DEVICES_ENDPOINT}/${id}`);
    return response || {};
  } catch (error) {
    console.error(`Error > deleteDeviceService:`, error);
    throw error;
  }
};

export const devicesBulkDeleteService = async (
  body: IDevicesBulkDeletePayload
): Promise<any> => {
  try {
    const response = await genericPost(DEVICES_BULK_DELETE_ENDPOINT, body);
    return response || {};
  } catch (error) {
    console.error(`Error > addDeviceService:`, error);
    throw error;
  }
};

export const getDevicesWithoutPaginationService = async (): Promise<any> => {
  try {
    const response = await genericGet(`${DEVICES_ENDPOINT}/without-pagination`);
    return response || [];
  } catch (error) {
    console.error(`Error > getDevicesWithoutPaginationService:`, error);
    throw error;
  }
};

export const getDevicesWithoutPaginationByIdsService = async (
  body: IDevicesBulkDeletePayload
): Promise<any> => {
  try {
    const response = await genericPost(
      `${DEVICES_ENDPOINT}/without-pagination`,
      body
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getDevicesWithoutPaginationService:`, error);
    throw error;
  }
};

export const getDevicesByUserService = async (userId: string): Promise<any> => {
  try {
    const response = await genericGet(`${DEVICES_ENDPOINT}/user/${userId}`);
    return response || [];
  } catch (error) {
    console.error(`Error > getDevicesByUserService:`, error);
    throw error;
  }
};
