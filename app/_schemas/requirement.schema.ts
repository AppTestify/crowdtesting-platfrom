import { z } from "zod";

export const requirementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  projectId: z.string().min(1, "ProjectId is required"),
  assignedTo: z.string().nullable().optional(),
  status: z.string().min(1, "Status is required"),
});
