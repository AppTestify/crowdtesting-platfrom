import { ITestCase } from "./test-case";
import { ITestCaseResult } from "./test-case-result";
import { IUserByAdmin } from "./user";

export interface ITestCyclePayload {
    title: string;
    testCaseResults?: string;
    projectId?: string;
    description: string;
    userId?: IUserByAdmin;
    id?: string;
    resultCounts?: {
        blocked: number;
        passed: number;
        failed: number;
        caused: number;
    };
}

export interface ITestCycle {
    _id?: string;
    title: string;
    projectId?: string;
    description: string;
    id: string;
    testCaseResults: ITestCaseResult[] | undefined;
    customId?: string;
    userId?: IUserByAdmin;
    createdAt?: string;
}

export interface IAssignedTestCase {
    testCaseIds: string[];
}

export interface IUnAssignedTestCase {
    testCaseIds: string[];
    isSingleDelete: boolean;
}