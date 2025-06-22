import { IProject } from "./project";
import { IUserByAdmin } from "./user";

export interface IRequirementPayload {
  title: string;
  description?: string;
  projectId?: string;
  attachments?: File[];
  assignedTo?: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
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
  assignedTo: IUserByAdmin;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
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

export interface IRequirementAssignMailPayload {
  email: string;
  fullName: string;
  title: string;
  description: string;
  assignedBy: string;
  status: string;
  projectName: string;
  startDate?: string;
  endDate?: string;
}
