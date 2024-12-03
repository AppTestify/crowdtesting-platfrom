import { IRequirement } from "./requirement";
import { ITestCaseResult } from "./test-case-result";
import { ITestSuite } from "./test-suite";
import { IUserByAdmin } from "./user";

export interface ITestCasePayload {
    title: string;
    projectId?: string;
    expectedResult: string;
    testSuite: string;
    requirements?: string[];
    userId?: IUserByAdmin;
}

export interface ITestCase {
    id: string;
    title: string;
    projectId?: string;
    expectedResult: string;
    testSuite?: ITestSuite;
    requirements?: IRequirement[];
    customId?: string;
    userId?: IUserByAdmin;
    createdAt?: string;
    _id?: string;
    testCaseResults?: ITestCaseResult[];
}