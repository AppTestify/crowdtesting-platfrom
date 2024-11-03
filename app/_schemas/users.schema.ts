import { z } from "zod";

export const userRoleUpdateSchema = z.object({
  _id: z.string(),
  role: z.string(),
});

export const paymentSchema = z.object({
  paypalId: z.string().min(1, "Paypal ID is required"),
});
