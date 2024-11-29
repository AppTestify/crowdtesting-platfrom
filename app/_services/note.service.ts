import { NOTE_ENPOINT, PAGINATION_QUERY_ENDPOINT } from "../_constants/api-endpoints";
import { INote } from "../_interface/note";
import { genericGet, genericPost } from "./generic-api-methods";

export const addNoteService = async (projectId: string, body: INote): Promise<any> => {
    try {
        const response = await genericPost(`${NOTE_ENPOINT(projectId)}`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > addNoteService:`, error);
        throw error;
    }
};

export const getNotesService = async (projectId: string, index: Number, pageSize: Number):
    Promise<any> => {
    try {
        const response = await genericGet(`${NOTE_ENPOINT(projectId)}${PAGINATION_QUERY_ENDPOINT(index, pageSize)}`);
        return response || [];
    } catch (error) {
        console.error(`Error > getNotesService:`, error);
        throw error;
    }
};