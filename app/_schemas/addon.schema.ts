import { z } from "zod";

// export const addonSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   description: z.string().min(1, "Description is required"),
//   amount: z.number({ required_error: "Amount is required" }),
//   amountType: z.string().min(1, "amount type is required"),
//   isActive: z.boolean().default(true),
// });


export const addonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.coerce
    .number()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(val), "Amount must be a valid number"),
  // amountType: z.enum(["flat", "percentage"], {
  //   required_error: "Amount type is required",
  // }),
  currency: z.string().min(1, "Required"),
  isActive: z.boolean().default(true),
});



export const addonBulkDeleteSchema = z.object({
  ids: z.array(z.string()).nonempty("Atleast one user is required"),
});


export const addonStatusSchema = z.object({
  isActive: z.boolean(),
});

