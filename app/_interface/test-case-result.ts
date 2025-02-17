import { ITestCase } from "./test-case";
import { ITestCaseData } from "./test-case-data";
import { ITestCaseStep } from "./test-case-step";
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
  customId?: string;
  updatedBy?: IUserByAdmin;
  testCaseData: ITestCaseData[];
  testCaseStep: ITestCaseStep[];
  original: ITestCaseResult
}

export interface ITestCaseResultPayload {
  actualResult: string;
  result: string;
  remarks?: string;
  isIssue?: boolean;
}
