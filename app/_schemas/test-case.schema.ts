import { z } from "zod";

export const testCaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  projectId: z.string().min(1, "ProjectId is required"),
  expectedResult: z.string().min(1, "ExpectedResult is required"),
  testSuite: z.string().min(1, "testSuite is required"),
  requirements: z.array(z.string().optional()),
  testType: z.string().optional(),
  severity: z.string().optional(),
});
