import { z } from "zod";

export const issueSchema = z.object({
    title: z.string().min(1, "Title is required"),
    severity: z.string().min(1, "Severity is required"),
    priority: z.string().min(1, "Priority is required"),
    description: z.string().min(1, "Description is required"),
    projectId: z.string().min(1, "ProjectId is required"),
    status: z.string().optional(),
    device: z.array(z.string()).nonempty("device is required")
});