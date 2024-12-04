import { PROJECTS_ENDPOINT } from "../_constants/api-endpoints";
import { IIssueAttachment } from "../_interface/issue";
import { genericDelete, genericGet, genericPostFormData } from "./generic-api-methods";

export const addIssueAttachmentsService = async (projectId: string, issueId: string, body: IIssueAttachment): Promise<any> => {
    try {
        const formData = new FormData();

        body.attachments.forEach((file) => {
            formData.append("attachments", file);
        });

        const response = await genericPostFormData(`${PROJECTS_ENDPOINT}/${projectId}/issue/${issueId}/attachment`, formData);
        return response || {};
    } catch (error) {
        console.error(`Error > addIssueAttachmentService:`, error);
        throw error;
    }
};

export const getIssueAttachmentsService = async (projectId: string, issueId: string): Promise<any> => {
    try {
        const response = await genericGet(`${PROJECTS_ENDPOINT}/${projectId}/issue/${issueId}/attachment`);
        return response || [];
    } catch (error) {
        console.error(`Error > getIssueAttachmentsService:`, error);
        throw error;
    }
};

export const deleteIssueAttachmentService = async (projectId: string, issueId: string, attachmentId: string): Promise<any> => {
    try {
        const response = await genericDelete(`${PROJECTS_ENDPOINT}/${projectId}/issue/${issueId}/attachment/${attachmentId}`);
        return response || {};
    } catch (error) {
        console.error(`Error > deleteIssueAttachmentService:`, error);
        throw error;
    }
};