import { z } from "zod";

export const certificationSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    issuedBy: z.string().optional(),
    issueDate: z.string().optional(),
});

export const addressSchema = z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().min(1, "PostalCode is required"),
    country: z.string().min(1, "Country is required")
});

export const testerSchema = z.object({
    skills: z.array(z.string()).nonempty("At least one skills is required"),
    bio: z.string().optional(),
    certifications: z.array(certificationSchema),
    address: addressSchema
});