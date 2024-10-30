import { PROJECTS_ENDPOINT } from "../_constants/api-endpoints";
import { IProjectPayload } from "../_interface/project";
import { genericPost } from "./generic-api-methods";


export const addProjectService = async (body: IProjectPayload): Promise<any> => {
    try {
        const response = await genericPost(PROJECTS_ENDPOINT, body);
        return response || {};
    } catch (error) {
        console.error(`Error > addDeviceService:`, error);
        throw error;
    }
};