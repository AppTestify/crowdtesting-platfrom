import { z } from "zod";

export const packageSchema = z.object({
  type: z.string().min(1, "Type is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  testers: z.number({ required_error: "Number of testers is required" }),
  durationHours: z.number({ required_error: "Duration is required" }),
  amount: z.number({ required_error: "Amount is required" }),
  currency: z.string().min(1, "currency is required"),
  bugs: z.number({ required_error: "Bugs are required" }),
  moreBugs: z.boolean().default(false),
  isCustom: z.boolean().default(false),
  isActive: z.boolean().default(true),
});