import { ITestCaseResult } from "./test-case-result";
import { ITestCycle } from "./test-cycle";
import { IUserByAdmin } from "./user";

export interface ITestExecutionPayload {
  projectId: string;
  testCycle: string;
  type?: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ITestExecution {
  id: string;
  projectId: string;
  testCycle: ITestCycle;
  testCaseResults: ITestCaseResult[];
  _id?: string;
  type?: string;
  startDate?: string | null;
  endDate?: string | null;
  customId: string;
  userId: IUserByAdmin;
  createdAt: string;
}
