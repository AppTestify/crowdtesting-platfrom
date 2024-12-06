import { z } from "zod";

export const adminSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
});

export const adminEmailSchema = z.object({
    emails: z.array(z.string()).nonempty("At least one email is required"),
});