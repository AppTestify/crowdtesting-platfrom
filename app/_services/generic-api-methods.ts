import { GENERIC_ERROR_MESSAGE } from "../_constants/errors";
import { HTTP_METHODS } from "../_constants/http-methods";

export const genericGet = async (endpoint: string): Promise<any> => {
  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || GENERIC_ERROR_MESSAGE);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
};

export const genericPost = async (
  endpoint: string,
  body: any = null,
  baseURL?: string
): Promise<any> => {
  const config: RequestInit = {
    method: HTTP_METHODS.POST,
    body: JSON.stringify(body),
  };

  try {
    const formattedEndpoint = baseURL ? `${baseURL}/${endpoint}` : endpoint;
    const response = await fetch(formattedEndpoint, config);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || GENERIC_ERROR_MESSAGE);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
};

export const genericPatch = async (
  endpoint: string,
  body: any = null,
  baseURL?: string
): Promise<any> => {
  const config: RequestInit = {
    method: HTTP_METHODS.PATCH,
    body: JSON.stringify(body),
  };

  try {
    const formattedEndpoint = baseURL ? `${baseURL}/${endpoint}` : endpoint;
    const response = await fetch(formattedEndpoint, config);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || GENERIC_ERROR_MESSAGE);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
};
