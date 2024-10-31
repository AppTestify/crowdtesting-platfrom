import { ISSUES_ENDPOINT } from "../_constants/api-endpoints";
import { IIssueAttachment } from "../_interface/issue";
import { genericPost } from "./generic-api-methods";

export const addIssueAttachmentService = async (issueId: string, body: IIssueAttachment): Promise<any> => {
    try {
        const response = await genericPost(`${ISSUES_ENDPOINT}/${issueId}/attachment`, body);
        return response || {};
    } catch (error) {
        console.error(`Error > addIssueAttachmentService:`, error);
        throw error;
    }
};