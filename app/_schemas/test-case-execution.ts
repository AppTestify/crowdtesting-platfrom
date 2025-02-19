import { z } from "zod";

export const testCaseExecutionSchema = z.object({
  result: z.string().min(1, "Reult is required"),
  actualResult: z.string().min(1, "Actual result is required"),
  remarks: z.string().optional(),
  isIssue: z.boolean().optional(),
  testCycle: z.string().optional(),
});
