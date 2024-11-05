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