import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  role: z.string(),
});

export const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string(),
});

export const googleSignUpSchema = z.object({
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
});

export const googleSignInSchema = z.object({
  email: z.string(),
});

export const accountVerificationSchema = z.object({
  token: z.string(),
});

export const adminUserCreateSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  role: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  sendCredentials: z.boolean(),
});