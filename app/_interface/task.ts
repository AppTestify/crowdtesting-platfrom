import { IIssue } from "./issue";
import { IRequirement } from "./requirement";
import { IUserByAdmin } from "./user";

export interface ITaskPayload {
  title: string;
  priority: string;
  status: string;
  description: string;
  issueId?: string | null;
  assignedTo?: string;
  requirementIds?: string[];
  startDate?: string | null;
  endDate?: string | null;
}

export interface ITask {
  _id?: string;
  title: string;
  priority: string;
  status: string;
  description: string;
  issueId?: IIssue;
  assignedTo?: IUserByAdmin;
  projectId: string;
  id: string;
  userId: IUserByAdmin;
  createdAt: string;
  requirementIds: IRequirement[];
  startDate?: string | null;
  endDate?: string | null;
}

export interface ITaskStatusPayload {
  status: string;
  id?: string;
  _id?: string;
}
