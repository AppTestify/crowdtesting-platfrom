import { ITestCase } from "./test-case";
import { ITestCycle } from "./test-cycle";
import { IUserByAdmin } from "./user";

export interface ITestCaseResult {
    id: string;
    testCycleId: ITestCycle;
    testCaseId: ITestCase;
    userId?: IUserByAdmin;
    createdAt?: string;
    _id?: string;
}