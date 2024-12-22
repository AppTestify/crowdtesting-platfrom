import { DOWNLOAD_FILE_ENDPOINT } from "../_constants/api-endpoints";
import { genericGet } from "../_services/generic-api-methods";

export const downloadDocument = (contentType: any, base64: any, name: any) => {
  const base64String = `data:${contentType};base64,${base64}`;

  const downloadLink = document.createElement("a");

  downloadLink.href = base64String;

  downloadLink.download = `${name}`;

  downloadLink.click();
};

export const PAGINATION_LIMIT = 10;

export const downloadFileFromDrive = async (fileId: string, fileName: string = 'attachment') => {
  try {
    const response = await fetch(`${DOWNLOAD_FILE_ENDPOINT}/${fileId}`);

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    const blob = await response.blob();
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    link.click();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error > getBrowserService:`, error);
    throw error;
  }
};
