import { z } from "zod";

export const packageSchema = z.object({
  type: z.string().min(1, "Type is required"),
  name: z.string().min(1, "Name is required"),
  testers: z.coerce.number().min(1, "Testers is required"),
  durationHours: z.coerce.number().optional(),
  bugs: z.coerce.number().min(0, "Bugs is required"),
  amount: z.coerce.number().min(0, "Amount is required"),
  currency: z.string().min(1, "Required"),
  moreBugs: z.boolean(),
  isCustom: z.boolean().optional(),
  isActive: z.boolean(),
  description: z.string().optional(),
  testCase: z.coerce.number().min(1),
  testExecution: z.coerce.number().min(1),
});


export const pricingBulkDeleteSchema = z.object({
  ids: z.array(z.string()).nonempty("Atleast one user is required"),
});


export const pricingStatusSchema = z.object({
  isActive: z.boolean(),
});
