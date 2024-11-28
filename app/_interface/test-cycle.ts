import { ITestCase } from "./test-case";
import { IUserByAdmin } from "./user";

export interface ITestCyclePayload {
    title: string;
    projectId?: string;
    description: string;
    userId?: IUserByAdmin;
}

export interface ITestCycle {
    title: string;
    projectId?: string;
    description: string;
    id: string;
    testCaseId?: ITestCase[];
}

export interface IAssignedTestCase {
    testCaseIds: string[];
}