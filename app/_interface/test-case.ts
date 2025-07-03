import { IRequirement } from "./requirement";
import { ITestCaseResult } from "./test-case-result";
import { ITestSuite } from "./test-suite";
import { IUserByAdmin } from "./user";

export interface ITestCasePayload {
  title: string;
  projectId?: string;
  expectedResult: string;
  precondition?: string;
  testSuite: string;
  requirements?: string[];
  userId?: IUserByAdmin;
  testType?: string;
  severity?: string;
  attachments?: any[];
}

export interface ITestCaseAttachment {
  attachment: any;
  base64: string;
  link: string;
}

export interface ITestCase {
  id: string;
  title: string;
  projectId?: string;
  expectedResult: string;
  precondition?: string;
  testSuite?: ITestSuite;
  requirements?: IRequirement[];
  customId: string;
  userId?: IUserByAdmin;
  createdAt?: string;
  _id?: string;
  testCaseResults?: ITestCaseResult[];
  testType?: string;
  severity?: string;
  attachments?: any[];
}

export interface ITestCaseAttachmentDisplay {
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

export interface TestCaseAttachmentsProps {
  testCaseId: string;
  isUpdate: boolean;
  isView: boolean;
  setAttachmentsData?: React.Dispatch<React.SetStateAction<any[]>>;
}
