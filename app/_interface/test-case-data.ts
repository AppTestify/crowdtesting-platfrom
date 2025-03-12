export interface ITestCaseDataPayload {
  testCases: {
    name: string;
    type: string;
    validation?: string[];
    inputValue: string;
    description: string;
    attachments?: any[];
  }[];
}

export interface ITestCaseData {
  name: string;
  type: string;
  validation?: string[];
  inputValue: string;
  description: string;
  _id: string;
  testCaseId: string;
  attachments?: any[];
}

export interface TestCaseDataAttachmentsProps {
  testCaseDataId: string;
  testCaseId: string;
  isUpdate: boolean;
  isView: boolean;
  setAttachmentsData?: React.Dispatch<React.SetStateAction<any[]>>;
}
