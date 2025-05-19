import { z } from "zod";

// export const packageSchema = z.object({
//   type: z.string().min(1, "Type is required"),
//   name: z.string().min(1, "Name is required"),
//   description: z.string().min(1, "Description is required"),
//   testers: z.number({ required_error: "Number of testers is required" }),
//   durationHours: z.number({ required_error: "Duration is required" }),
//   amount: z.number({ required_error: "Amount is required" }),
//   currency: z.string().min(1, "currency is required"),
//   bugs: z.number({ required_error: "Bugs are required" }),
//   moreBugs: z.boolean().default(false),
//   isCustom: z.boolean().default(false),
//   isActive: z.boolean().default(true),
// });



export const packageSchema = z.object({
  type: z.string().min(1, "Type is required"),
  name: z.string().min(1, "Name is required"),
  testers: z.coerce.number().min(1, "Testers is required"),
  durationHours: z.coerce.number().optional(),
  bugs: z.coerce.number().min(0, "Bugs is required"),
  amount: z.coerce.number().min(1, "Amount is required"),
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
