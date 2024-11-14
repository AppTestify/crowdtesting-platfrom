import { IDevice } from "./device";

export interface IIssue {
  id: string;
  title: string;
  severity: string;
  priority: string;
  projectId: string;
  description?: string;
  status?: string;
  userId?: string;
  device: IDevice[];
}

export interface IIssuePayload {
  title: string;
  severity: string;
  priority: string;
  description?: string;
  status?: string;
  projectId?: string;
  attachments?: File[];
  device: string[];
  id?: string;
  _id?: string;
}

export interface IIssueAttachment {
  attachments: File[];
}

export interface IssueAttachmentsProps {
  issueId: string;
  isUpdate: boolean;
  isView: boolean;
  setAttachmentsData?: React.Dispatch<React.SetStateAction<any[]>>;
}

export interface IIssueAttachmentDisplay {
  id: string;
  data: string;
  name: string;
  contentType?: string;
}
