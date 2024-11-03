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
  attachments: File;
}
