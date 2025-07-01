import {
  GET_PRICING_ENPOINT,
  getPackageByIdEndpoint,
    PACKAGE_ENDPOINT,
    PAGINATION_QUERY_ENDPOINT,
    PRICING_BULK_DELETE_ENDPOINT,
  } from "../_constants/api-endpoints";
import { IPackagePayload, pricingBulkDeletePayload} from "../_interface/package";
import { genericDelete, genericGet, genericPost, genericPut } from "./generic-api-methods";


  export const getPackageService = async (
    index: Number,
    pageSize: Number,
    searchString?: string
  ): Promise<any> => {
    try {
      const response = await genericGet(
        `${PACKAGE_ENDPOINT}${PAGINATION_QUERY_ENDPOINT(
          index,
          pageSize
        )}&searchString=${searchString}`
      );
      return response || [];
    } catch (error) {
      console.error(`Error > getPackages:`, error);
      throw error;
    }
  };

// View Package services


  // export const getViewPricingService = async (pricingId: string): Promise<any> => {
  //   try {
  //     const response = await genericGet(`${VIEW_PRICING_PACKAGE_ENDPOINT(pricingId)}`);
  //     return response || [];
  //   } catch (error) {
  //     console.error(`Error > getViewPricingService:`, error);
  //     throw error;
  //   }
  // };

  export const getViewPricingService = async (pricingId: string): Promise<any> => {
    try {
      const response = await genericGet(getPackageByIdEndpoint(pricingId));
      return response || [];
    } catch (error) {
      console.error(`Error > getViewPricingService:`, error);
      throw error;
    }
  };

  
  export const addPackageService = async (body: IPackagePayload): Promise<any> => {
    try {
      const response = await genericPost(PACKAGE_ENDPOINT, body);
      return response || {};
    } catch (error) {
      console.error(`Error > addPACKAGEService:`, error);
      throw error;
    }
  };
  
  export const updatePackageService = async (
    id: string,
    body: IPackagePayload
  ): Promise<any> => {
    try {
      const response = await genericPut(`${PACKAGE_ENDPOINT}/${id}`, body);
      return response || {};
    } catch (error) {
      console.error(`Error > updatePackageService:`, error);
      throw error;
    }
  };
  
  export const deletePackageService = async (id: string): Promise<any> => {
    try {
      const response = await genericDelete(`${PACKAGE_ENDPOINT}/${id}`);
      return response || {};
    } catch (error) {
      console.error(`Error > deletePackageService:`, error);
      throw error;
    }
  };

  // Bulk delete package service
export const pricingBulkDeleteService = async (
  body: pricingBulkDeletePayload
): Promise<any> => {
  try {
    const response = await genericPost(PRICING_BULK_DELETE_ENDPOINT, body);
    return response || {};
  } catch (error) {
    console.error(`Error > pricingBulkDeleteService:`, error);
    throw error;
  }
};

export const updatePricingStatus = async (
  pricingId: string,
  isActive: boolean
): Promise<any> => {
  try {
    const response = await genericPut(`${GET_PRICING_ENPOINT(pricingId)}/status`, {
      isActive,
    });
    return response || {};
  } catch (error) {
    console.error(`Error > updatePricingStatus:`, error);
    throw error;
  }
};

export const getPackageForClientService = async (): Promise<any> => {
  try {
    const response = await genericGet(`${PACKAGE_ENDPOINT}/client?status=true`);
    return response || [];
  } catch (error) {
    console.error(`Error > getPackages:`, error);
    throw error;
  }
};

