import { z } from "zod";

export const testCycleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  projectId: z.string().min(1, "ProjectId is required"),
  description: z.string().min(1, "description is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export const assignTestCasesSchema = z.object({
  testCaseIds: z.array(z.string().min(1, "Atleast one testCase required")),
});

export const unAssignTestCasesSchema = z.object({
  testCaseIds: z.array(z.string().min(1, "Atleast one testCase required")),
  isSingleDelete: z.boolean(),
  testCases: z.array(z.string().optional()).optional(),
});
