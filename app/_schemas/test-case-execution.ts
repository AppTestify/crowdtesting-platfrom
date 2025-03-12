import { z } from "zod";

export const testCaseExecutionSchema = z.object({
  result: z.string().min(1, "Reult is required"),
  // actualResult: z.string().min(1, "Actual result is required"),
  remarks: z.string().optional(),
  isIssue: z.coerce.boolean().optional(),
  testCycleId: z.string().nullable().optional(),
  testSteps: z.array(
    z.object({
      index: z.number(),
      status: z.string().min(1),
    })
  ),
});
