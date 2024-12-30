import { IDevice } from "./device";
import { ITestCycle } from "./test-cycle";
import { IUserByAdmin } from "./user";

export interface IIssue {
  _id?: string;
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
  issueType?: string;
  testCycle: ITestCycle;
  attachments?: IIssueAttachment[];
}

export interface IIssueView {
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
  issueType?: string;
  testCycle: ITestCycle;
}

export interface IIssuePayload {
  testCycle: string;
  title: string;
  severity: string;
  priority: string;
  description?: string;
  status?: string;
  projectId?: string;
  issueType: string;
  attachments?: File[];
  device: string[];
  id?: string;
  _id?: string;
}

export interface IIssueStatusPayload {
  status: string;
  id?: string;
  _id?: string;
}

export interface IIssueAttachment {
  attachment: any;
  base64: string;
}

export interface IssueAttachmentsProps {
  issueId: string;
  isUpdate: boolean;
  isView: boolean;
  setAttachmentsData?: React.Dispatch<React.SetStateAction<any[]>>;
}

export interface IIssueAttachmentDisplay {
  attachment: {
    _id: string;
    id: string;
    data: string;
    name: string;
    contentType?: string;
    cloudId: string;
  };
  base64: any;
}
