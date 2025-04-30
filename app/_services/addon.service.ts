import {
  ADDON_ENDPOINT,
  PAGINATION_QUERY_ENDPOINT,
} from "../_constants/api-endpoints";
import { IAddonPayload } from "../_interface/addon";

import {
  genericDelete,
  genericGet,
  genericPost,
  genericPut,
} from "./generic-api-methods";

export const getAddonService = async (
  index: Number,
  pageSize: Number,
  searchString?: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${ADDON_ENDPOINT}${PAGINATION_QUERY_ENDPOINT(
        index,
        pageSize
      )}&searchString=${searchString}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getAddon:`, error);
    throw error;
  }
};

export const addAddonService = async (
  body: IAddonPayload
): Promise<any> => {
  try {
    const response = await genericPost(ADDON_ENDPOINT, body);
    return response || {};
  } catch (error) {
    console.error(`Error > addAddonService:`, error);
    throw error;
  }
};

export const updateAddonService = async (
  id: string,
  body: IAddonPayload
): Promise<any> => {
  try {
    const response = await genericPut(`${ADDON_ENDPOINT}/${id}`, body);
    return response || {};
  } catch (error) {
    console.error(`Error > updateAddonService:`, error);
    throw error;
  }
};

export const deleteAddonService = async (id: string): Promise<any> => {
  try {
    const response = await genericDelete(`${ADDON_ENDPOINT}/${id}`);
    return response || {};
  } catch (error) {
    console.error(`Error > deleteAddonService:`, error);
    throw error;
  }
};
