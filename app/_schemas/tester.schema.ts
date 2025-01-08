import { z } from "zod";

export const certificationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  issuedBy: z.string().optional(),
});

export const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export const languageSchema = z.object({
  name: z.string().optional(),
  proficiency: z.string().optional(),
});

export const testerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  skills: z.array(z.string().optional()).optional(),
  bio: z.string().optional(),
  certifications: z.array(certificationSchema).optional(),
  address: addressSchema.optional(),
  languages: z.array(languageSchema).optional(),
});
