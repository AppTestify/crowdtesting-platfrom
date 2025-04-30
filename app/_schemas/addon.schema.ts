import { z } from "zod";

export const addonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.number({ required_error: "Amount is required" }),
  amountType: z.string().min(1, "amount type is required"),
  isActive: z.boolean().default(true),
});