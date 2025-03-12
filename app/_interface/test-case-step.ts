export interface ITestCaseStepPayload {
  description: string;
  additionalSelectType?: string;
  selectedType?: boolean;
  expectedResult?: string;
}

export interface ITestCaseStep {
  description: string;
  additionalSelectType?: string;
  selectedType?: boolean;
  _id: string;
  order?: number;
  projectId: string;
  testCaseId: string;
  expectedResult: string;
}

export interface ITestCaseStepSequencePayload {
  description: string;
  additionalSelectType?: string;
  selectedType?: boolean;
  _id: string;
  order?: number;
}
