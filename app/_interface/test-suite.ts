import { IRequirement } from "./requirement";
import { IUserByAdmin } from "./user";

export interface ITestSuitePayload {
    title: string;
    description: string;
    requirements?: string[];
    projectId?: string;
}

export interface ITestSuite {
    _id?: string;
    title: string;
    description: string;
    requirements?: IRequirement[];
    id: string;
    projectId: string;
    userId: IUserByAdmin;
    customId?: string;
    createdAt?: string;
}