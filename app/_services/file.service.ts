import { FILES_ENDPOINT } from "../_constants/api-endpoints";
import {
  genericDelete,
  genericFileGet,
  genericGet,
  genericPostFormData,
  genericPut,
} from "./generic-api-methods";

export const getFilesByUserIdService = async (): Promise<any> => {
  try {
    const response = await genericGet(FILES_ENDPOINT);

    return response || {};
  } catch (error) {
    console.error(`Error > getFilesByUserId:`, error);
    throw error;
  }
};

export const uploadFileService = async (
  file: File,
  fileType: string
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType);

    const response = await genericPostFormData(FILES_ENDPOINT, formData);
    return response || {};
  } catch (error) {
    console.error(`Error > uploadFileService:`, error);
    throw error;
  }
};

export const deleteFileService = async (fileId: string): Promise<any> => {
  try {
    const response = await genericDelete(`${FILES_ENDPOINT}/${fileId}`);
    return response || {};
  } catch (error) {
    console.error(`Error > deleteFileService:`, error);
    throw error;
  }
};

export const getFileService = async (fileId: string): Promise<any> => {
  try {
    const response = await genericFileGet(`${FILES_ENDPOINT}/${fileId}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = "downloadedFile";

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+)"?/);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1]).replace(/["']/g, "").trim();
      }
    }

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return {
      message: "Document downloaded successfully",
    };
  } catch (error) {
    console.error(`Error > getFileService:`, error);
    throw error;
  }
};

export const getFilesByUserIdToAdminService = async (userId: string): Promise<any> => {
  try {
    const response = await genericGet(`${FILES_ENDPOINT}/user/${userId}`);

    return response || {};
  } catch (error) {
    console.error(`Error > getFilesByUserIdToAdminService:`, error);
    throw error;
  }
};

export const getApprovalFilesService = async (verify: boolean): Promise<any> => {
  try {
    const response = await genericGet(`${FILES_ENDPOINT}/approval?verify=${verify}`);

    return response || {};
  } catch (error) {
    console.error(`Error > getApprovalFilesService:`, error);
    throw error;
  }
};

export const verifyFileService = async (fileId: string): Promise<any> => {
  try {
    const response = await genericPut(`${FILES_ENDPOINT}/${fileId}/verify`);

    return response || {};
  } catch (error) {
    console.error(`Error > verifyFileService:`, error);
    throw error;
  }
};

export const verifyFilesService = async (fileIds: string): Promise<any> => {
  try {
    const response = await genericPut(`${FILES_ENDPOINT}/multiple-verify`, fileIds);

    return response || {};
  } catch (error) {
    console.error(`Error > verifyFileService:`, error);
    throw error;
  }
};