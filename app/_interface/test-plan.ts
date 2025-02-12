import { IProject } from "./project";
import { IUserByAdmin } from "./user";

export interface ITestPlanParameter {
  parameter: string;
  description: string;
}

export interface ITestPlanPayload {
  title: string;
  projectId?: string;
  parameters?: ITestPlanParameter[];
  userId?: IUserByAdmin;
  assignedTo?: any;
}

export interface ITestPlan {
  id: string;
  title: string;
  projectId: IProject;
  parameters?: ITestPlanParameter[];
  customId?: string;
  userId?: IUserByAdmin;
  createdAt?: string;
  updatedAt: string;
  assignedTo: IUserByAdmin;
  startDate?: string | null;
  endDate?: string | null;
}
