import { ITestCase } from "./test-case";
import { ITestCaseResult } from "./test-case-result";
import { IUserByAdmin } from "./user";

export interface ITestCyclePayload {
  title: string;
  testCaseResults?: string;
  testCycle?: ITestCycle;
  projectId?: string;
  customId?: string;
  description: string;
  userId?: IUserByAdmin;
  attachments?: File[];
  startDate: Date;
  endDate: Date;
  id?: string;
  type?: string;
  resultCounts?: {
    blocked: number;
    passed: number;
    failed: number;
    caused: number;
  };
  // country: string;
  // isEmailSend: boolean;
}

export interface ITestCycle {
  _id?: string;
  title: string;
  projectId?: string;
  description: string;
  id: string;
  testCaseResults: ITestCaseResult[] | undefined;
  testCases: ITestCase[];
  customId?: string;
  userId?: IUserByAdmin;
  createdAt?: string;
  startDate: string;
  endDate: string;
}

export interface IAssignedTestCase {
  testCaseIds: string[];
}

export interface IUnAssignedTestCase {
  testCaseIds: string[];
  isSingleDelete: boolean;
  testCases?: string[];
}

export interface ITestCycleAttachment {
  attachment: {
    _id: string;
    id: string;
    data: string;
    name: string;
    contentType?: string;
    cloudId: string;
  };
  base64: any;
}

export interface TestCycleAttachmentsProps {
  testCycleId: string;
  isUpdate: boolean;
  isView: boolean;
  setAttachmentsData?: React.Dispatch<React.SetStateAction<any[]>>;
}

export interface ITestCycleCountryMailPayload {
  name: string;
  emails: string[];
  fullName?: string[];
  description: string;
  startDate: string;
  endDate: string;
  applyLink: string;
}

export interface ITestCycleVerificationPayload {
  token: string;
}