import { WEBSITE_ENDPOINT, WEBSITE_LOGO_ENDPOINT } from "../_constants/api-endpoints";
import { IWebsiteLogo, IWebsitePayload } from "../_interface/website";
import { genericDelete, genericGet, genericPost, genericPostFormData } from "./generic-api-methods";

export const updateWebsiteLogoService = async (body: IWebsiteLogo): Promise<any> => {
    try {
        const formData = new FormData();
        formData.append("logo", body?.logo);
        const response = await genericPostFormData(`${WEBSITE_LOGO_ENDPOINT}`, formData);
        return response || {};
    } catch (error) {
        console.error(`Error > updateWebsiteLogoService:`, error);
        throw error;
    }
};

export const updateWebsiteService = async (body: IWebsitePayload): Promise<any> => {
    try {
        const response = await genericPost(`${WEBSITE_ENDPOINT}`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > updateWebsiteService:`, error);
        throw error;
    }
};

export const getWebsiteService = async (): Promise<any> => {
    try {
        const response = await genericGet(`${WEBSITE_ENDPOINT}`);
        return response || [];
    } catch (error) {
        console.error(`Error > getWebsiteService:`, error);
        throw error;
    }
};

export const deleteWebsiteLogoService = async (): Promise<any> => {
    try {
        const response = await genericDelete(`${WEBSITE_LOGO_ENDPOINT}`);
        return response || [];
    } catch (error) {
        console.error(`Error > deleteWebsiteLogoService:`, error);
        throw error;
    }
};