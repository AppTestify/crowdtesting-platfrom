import {
  ADDON_BULK_DELETE_ENDPOINT,
  ADDON_ENDPOINT,
  GET_ADDON_ENPOINT,
  getAddonByIdEndpoint,
  PAGINATION_QUERY_ENDPOINT,
} from "../_constants/api-endpoints";
import { addonBulkDeletePayload, IAddonPayload } from "../_interface/addon";

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


export const getViewAddonService = async (addonId: string): Promise<any> => {
    try {
      const response = await genericGet(getAddonByIdEndpoint(addonId));
      return response || [];
    } catch (error) {
      console.error(`Error > getViewAddonService:`, error);
      throw error;
    }
  };


    // Bulk delete Addon service
  export const addonBulkDeleteService = async (
    body: addonBulkDeletePayload
  ): Promise<any> => {
    try {
      const response = await genericPost(ADDON_BULK_DELETE_ENDPOINT, body);
      return response || {};
    } catch (error) {
      console.error(`Error > pricingBulkDeleteService:`, error);
      throw error;
    }
  };




  export const updateAddonStatus = async (
    addonId: string,
    isActive: boolean
  ): Promise<any> => {
    try {
      const response = await genericPut(`${GET_ADDON_ENPOINT(addonId)}/status`, {
        isActive,
      });
      return response || {};
    } catch (error) {
      console.error(`Error > updatePricingStatus:`, error);
      throw error;
    }
  };