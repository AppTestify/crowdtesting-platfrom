import { z } from "zod";

export const TaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  priority: z.string().min(1, "Priority is required"),
  status: z.string().min(1, "Status is required"),
  description: z.string().min(1, "description is required"),
  issueId: z.string().nullable(),
  requirementIds: z.array(z.string()).optional(),
  assignedTo: z.string().optional(),
});

export const taskStatusSchema = z.object({
  status: z.string().min(1, "Status is required"),
});
