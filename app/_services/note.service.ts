import { NOTE_ENPOINT, PAGINATION_QUERY_ENDPOINT } from "../_constants/api-endpoints";
import { INote, INotePayload } from "../_interface/note";
import { genericDelete, genericGet, genericPost, genericPut } from "./generic-api-methods";

export const addNoteService = async (projectId: string, body: INotePayload): Promise<any> => {
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

export const deleteNoteService = async (
    projectId: string,
    noteId: string
): Promise<any> => {
    try {
        const response = await genericDelete(`${NOTE_ENPOINT(projectId)}/${noteId}`);
        return response || {};
    } catch (error) {
        console.error(`Error > deleteNoteService:`, error);
        throw error;
    }
};

export const updateNoteService = async (
    projectId: string,
    noteId: string,
    body: INotePayload
): Promise<any> => {
    try {
        const response = await genericPut(`${NOTE_ENPOINT(projectId)}/${noteId}`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > updateNoteService:`, error);
        throw error;
    }
};