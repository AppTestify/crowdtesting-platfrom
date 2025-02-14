import {
  INVOICE_ENDPOINT,
  PAGINATION_QUERY_ENDPOINT,
} from "../_constants/api-endpoints";
import {
  genericDelete,
  genericGet,
  genericPostFormData,
} from "./generic-api-methods";

export const addInvocieService = async (file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await genericPostFormData(INVOICE_ENDPOINT, formData);
    return response || {};
  } catch (error) {
    console.error(`Error > addInvocieService:`, error);
    throw error;
  }
};

export const getInvoiceService = async (
  index: Number,
  pageSize: Number,
  searchString: string,
  from?: string,
  to?: string
): Promise<any> => {
  try {
    const response = await genericGet(
      `${INVOICE_ENDPOINT}${PAGINATION_QUERY_ENDPOINT(
        index,
        pageSize
      )}&searchString=${searchString}&from=${from}&to=${to}`
    );
    return response || [];
  } catch (error) {
    console.error(`Error > getInvoiceService:`, error);
    throw error;
  }
};

export const deleteInvoiceService = async (invoiceId: string): Promise<any> => {
  try {
    const response = await genericDelete(`${INVOICE_ENDPOINT}/${invoiceId}`);
    return response || [];
  } catch (error) {
    console.error(`Error > deleteInvoiceService:`, error);
    throw error;
  }
};
