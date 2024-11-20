export interface ITestSuitePayload {
    title: string;
    description: string;
    requirements?: string[];
    projectId?: string;
}

export interface ITestSuite {
    title: string;
    description: string;
    requirements?: string[];
    id: string;
    projectId: string;
}