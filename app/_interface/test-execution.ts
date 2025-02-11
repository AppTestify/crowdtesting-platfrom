export interface ITestExecutionPayload {
  projectId: string;
  testCycle: string;
  type?: string;
  startDate?: string | null;
  endDate?: string | null;
}
