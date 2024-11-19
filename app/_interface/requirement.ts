import { IUser } from "./user";

export interface IRequirementPayload {
    title: string;
    description?: string;
    projectId?: string;
    attachments?: File[];
}

export interface IRequirement {
    id: string;
    title: string;
    projectId: string;
    description?: string;
    userId: IUser;
    customId: string;
}

export interface IRequirementAttachmentDisplay {
    id: string;
    data: string;
    name: string;
    requirementId?: string;
    contentType: string;
}

export interface RequirementAttachmentsProps {
    requirementId: string;
    isUpdate: boolean;
    isView: boolean;
    setAttachmentsData?: React.Dispatch<React.SetStateAction<any[]>>;
}

export interface IRequirementAttachment {
    attachments: File[];
}
