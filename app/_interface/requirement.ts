import { IProject } from "./project";
import { IUserByAdmin } from "./user";

export interface IRequirementPayload {
  title: string;
  description?: string;
  projectId?: string;
  attachments?: File[];
}

export interface IRequirement {
  _id?: string;
  id: string;
  title: string;
  projectId: IProject;
  description?: string;
  userId: IUserByAdmin;
  customId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IRequirementAttachmentDisplay {
  id: string;
  data: string;
  name: string;
  requirementId?: string;
  contentType: string;
  cloudId: string;
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
