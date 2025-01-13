import { IUserByAdmin } from "./user";

export interface IReport {
  description: string;
  title: string;
  projectId: string;
  _id: string;
  userId: IUserByAdmin;
  createdAt: string;
  attachments?: File[];
}

export interface IReportAttachment {
  attachment: any;
  base64: string;
  link: string;
}

export interface ReportAttachmentsProps {
  reportId: string;
  isUpdate: boolean;
  isView: boolean;
  setAttachmentsData?: React.Dispatch<React.SetStateAction<any[]>>;
}

export interface IReportPayload {
  title: string;
  projectId?: string;
  description: string;
  userId?: IUserByAdmin;
  attachments?: File[];
}

export interface IReportAttachmentDisplay {
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
