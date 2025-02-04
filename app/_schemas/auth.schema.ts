import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  role: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  country: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string(),
  rememberMe: z.boolean().optional(),
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

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: "Token is required" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmedPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
  })
  .refine((data) => data.password === data.confirmedPassword, {
    message: "Password doesnot matched",
    path: ["confirmedPassword"],
  });
