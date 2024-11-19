import { REQUIREMENT_ATTACHMENT_ENPOINT } from "../_constants/api-endpoints";
import { IRequirementAttachment } from "../_interface/requirement";
import { genericDelete, genericGet, genericPostFormData } from "./generic-api-methods";

export const addRequirementAttachmentsService = async (projectId: string, requirementId: string, body: IRequirementAttachment): Promise<any> => {
    try {
        const formData = new FormData();

        body.attachments.forEach((file) => {
            formData.append("attachments", file);
        });

        const response = await genericPostFormData(REQUIREMENT_ATTACHMENT_ENPOINT(projectId, requirementId), formData);
        return response || {};
    } catch (error) {
        console.error(`Error > addRequirementAttachmentsService:`, error);
        throw error;
    }
};

export const getRequirementAttachmentsService = async (projectId: string, requirementId: string): Promise<any> => {
    try {
        const response = await genericGet(REQUIREMENT_ATTACHMENT_ENPOINT(projectId, requirementId));
        return response || [];
    } catch (error) {
        console.error(`Error > getRequirementAttachmentsService:`, error);
        throw error;
    }
};

export const deleteRequirementAttachmentService = async (projectId: string, requirementId: string, attachmentId: string): Promise<any> => {
    try {
        const response = await genericDelete(`${REQUIREMENT_ATTACHMENT_ENPOINT(projectId, requirementId)}/${attachmentId}`);
        return response || {};
    } catch (error) {
        console.error(`Error > deleteRequirementAttachmentService:`, error);
        throw error;
    }
};