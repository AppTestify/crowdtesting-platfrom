import { z } from "zod";

export const testPlanSchema = z.object({
    title: z.string().min(1, "Title is required"),
    projectId: z.string().min(1, "ProjectId is required"),
    requirements: z.array(z.string()),
    parameters: z.array(z.object({
        parameter: z.string().min(1, "Parameter is required"),
        description: z.string().min(1, "Description is required")
    })),
});