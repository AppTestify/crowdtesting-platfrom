import { z } from "zod";

export const projectSchema = z.object({
    title: z.string().min(1, "Title is required"),
    startDate: z
        .string()
        .nullable(),
    endDate: z
        .string()
        .nullable(),
    description: z.string().optional(),
    isActive: z.boolean().optional()
});

export const projectsBulkDeleteSchema = z.object({
    ids: z.array(z.string()).nonempty("Atleast one project is required")
});

export const projectStatusSchema = z.object({
    isActive: z.boolean()
});

export const projectUserSchema = z.object({
    userId: z.string().min(1, "UserId is required"),
    role: z.string().optional()
});