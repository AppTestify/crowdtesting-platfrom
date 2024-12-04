import { ITestCase } from "./test-case";
import { ITestCaseResult } from "./test-case-result";
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
    testCaseResults: ITestCaseResult[];
    customId?: string;
}

export interface IAssignedTestCase {
    testCaseIds: string[];
}

export interface IUnAssignedTestCase {
    testCaseIds: string[];
    isSingleDelete: boolean;
}