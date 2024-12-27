import { z } from "zod";

export const certificationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  issuedBy: z.string().optional(),
});

export const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "PostalCode is required"),
  country: z.string().min(1, "Country is required"),
});

export const languageSchema = z.object({
  name: z.string().min(1, "Language name is required"),
  proficiency: z.string().optional(),
});

export const testerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  skills: z.array(z.string().min(1, "Skill is required")).min(1),
  bio: z.string().optional(),
  certifications: z.array(certificationSchema).min(1),
  address: addressSchema,
  languages: z.array(languageSchema),
});
