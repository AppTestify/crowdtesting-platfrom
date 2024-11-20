import { z } from "zod";

export const testSuiteSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    projectId: z.string().min(1, "ProjectId is required"),
    requirements: z.array(z.string())
});