import { ISSUES_ENDPOINT, ISSUES_PROJECT_ENDPOINT } from "../_constants/api-endpoints";
import { IIssuePayload } from "../_interface/issue";
import { genericDelete, genericGet, genericPost, genericPut } from "./generic-api-methods";


export const getIssuesService = async (id: string): Promise<any> => {
    try {
        const response = await genericGet(`${ISSUES_PROJECT_ENDPOINT}/${id}`);
        return response || [];
    } catch (error) {
        console.error(`Error > getIssues:`, error);
        throw error;
    }
}

export const addIssueService = async (body: IIssuePayload): Promise<any> => {
    try {
        const response = await genericPost(ISSUES_ENDPOINT, body);
        return response || {};
    } catch (error) {
        console.error(`Error > addIssueService:`, error);
        throw error;
    }
};

export const deleteIssueService = async (id: string): Promise<any> => {
    try {
        const response = await genericDelete(`${ISSUES_ENDPOINT}/${id}`);
        return response || {};
    } catch (error) {
        console.error(`Error > deleteIssueService:`, error);
        throw error;
    }
};

export const updateIssueService = async (
    id: string,
    body: IIssuePayload
): Promise<any> => {
    try {
        const response = await genericPut(`${ISSUES_ENDPOINT}/${id}`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > updateIssueService:`, error);
        throw error;
    }
};