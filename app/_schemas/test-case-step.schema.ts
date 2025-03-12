import { z } from "zod";

export const testCaseStepSchema = z.object({
  description: z.string().min(1, "Description is required"),
  selectedType: z.boolean().optional(),
  additionalSelectType: z.string().optional(),
  expectedResult: z.string().optional(),
});

export const testCaseStepSequenceSchema = z.object({
  description: z.string().min(1, "Description is required"),
  selectedType: z.boolean().optional(),
  additionalSelectType: z.string().optional(),
  _id: z.string().optional(),
  order: z.number(),
});
