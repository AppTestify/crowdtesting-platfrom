import { z } from "zod";

export const testCycleSchema = z.object({
    title: z.string().min(1, "Title is required"),
    projectId: z.string().min(1, "ProjectId is required"),
    description: z.string().min(1, "description is required"),
});