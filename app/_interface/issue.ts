export interface IIssue {
  id: string;
  title: string;
  severity: string;
  priority: string;
  projectId: string;
  description?: string;
  status?: string;
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
  attachments: File[];
}

export interface IssueAttachmentsProps {
  issueId: string;
  isUpdate: boolean;
  isView: boolean;
}

export interface IIssueAttachmentDisplay {
  id: string;
  data: string;
  name: string;
  contentType: string;
}