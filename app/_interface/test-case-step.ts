export interface ITestCaseStepPayload {
    description: string;
    additionalSelectType?: string;
    selectedType?: boolean;
}

export interface ITestCaseStep {
    description: string;
    additionalSelectType?: string;
    selectedType?: boolean;
    _id: string;
    order?: number;
    projectId: string;
    testCaseId: string;
}

export interface ITestCaseStepSequencePayload {
    description: string;
    additionalSelectType?: string;
    selectedType?: boolean;
    _id: string;
    order?: number;
}