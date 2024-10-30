import { z } from "zod";

export const ProjectSchema = z.object({
    title: z.string().min(1, "Title is required"),
    startDate: z
        .string()
        .min(1, "Start date is required"),
    endDate: z
        .string()
        .min(1, "End date is required"),
    description: z.string().optional(),
    isActive: z.boolean()
})

export const projectsBulkDeleteSchema = z.object({
    ids: z.array(z.string()).nonempty("Atleast one project is required")
})