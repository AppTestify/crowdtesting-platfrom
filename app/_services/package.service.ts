import {
    PACKAGE_ENDPOINT,
    PAGINATION_QUERY_ENDPOINT,
  } from "../_constants/api-endpoints";
import { IPackagePayload } from "../_interface/package";
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