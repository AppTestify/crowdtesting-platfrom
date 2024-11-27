export interface ITestCaseDataPayload {
    testCases: {
        name: string;
        type: string;
        validation?: string[];
        inputValue: string;
        description: string;
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
}