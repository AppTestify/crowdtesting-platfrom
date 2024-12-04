import { ITestCase } from "./test-case";
import { ITestCycle } from "./test-cycle";
import { IUserByAdmin } from "./user";

export interface ITestCaseResult {
    id: string;
    _id?: string;
    userId?: IUserByAdmin;
    testCycleId: ITestCycle;
    testCaseId: ITestCase;
    createdAt?: string;
    updatedAt?: string;
    actualResult?: string;
    result?: string;
    remarks?: string;
    isStarted: boolean;
    updatedBy?: string;
}