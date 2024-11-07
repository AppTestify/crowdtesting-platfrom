import { z } from "zod";

export const userRoleUpdateSchema = z.object({
  _id: z.string(),
  role: z.string(),
});

export const paymentSchema = z.object({
  paypalId: z.string().min(1, "Paypal ID is required"),
});

export const userSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  isActive: z.boolean()
})

export const usersBulkDeleteSchema = z.object({
  ids: z.array(z.string()).nonempty("Atleast one user is required")
});

export const userStatusSchema = z.object({
  isActive: z.boolean()
});

export const userPasswordSchema = z.object({
  password: z.string().min(1, "Password is required"),
  confirmedPassword: z.string().min(1, "Confirmed password is required"),
}).refine((data) => data.password === data.confirmedPassword, {
  message: "Password don't match",
  path: ["confirmedPassword"]
});