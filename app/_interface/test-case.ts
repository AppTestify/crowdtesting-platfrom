export interface ITestCasePayload {
    title: string;
    projectId: string;
    expectedResult: string;
    testSuite: string;
    requirements?: string[];
}