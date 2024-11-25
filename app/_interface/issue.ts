import { IDevice } from "./device";
import { IUserByAdmin } from "./user";

export interface IIssue {
  id: string;
  title: string;
  severity: string;
  priority: string;
  projectId: string;
  description?: string;
  status?: string;
  userId?: IUserByAdmin;
  device: IDevice[];
  createdAt?: string;
  customId?: string;
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
