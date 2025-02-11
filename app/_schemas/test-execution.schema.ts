import { z } from "zod";

export const testExecutionSchema = z.object({
  projectId: z.string().min(1, "ProjectId is required"),
  testCycle: z.string().min(1, "testCycle is required"),
  type: z.string().optional(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});
