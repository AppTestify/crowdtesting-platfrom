interface ITestPlanParameter {
    parameter: string;
    description: string;
}

export interface ITestPlanPayload {
    title: string;
    projectId: string;
    parameters?: ITestPlanParameter[];
}