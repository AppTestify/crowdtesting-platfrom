
export interface IIssue {
    _id: string;
    id: string;
    title: string;
    severity: string;
    priority: string;
    description?: string;
    status?: string;
    projectId?: string;
    userId?: string;
}

export interface IIssuePayload {
    title: string;
    severity: string;
    priority: string;
    description?: string;
    status?: string;
    projectId?: string;
}

export interface IIssueAttachment {
    attachments: File;
}