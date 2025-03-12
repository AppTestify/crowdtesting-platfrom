import { z } from "zod";

export const testCaseDataSchema = z.object({
  testCases: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      type: z.string().min(1, "Type is required"),
      validation: z.array(z.string().optional()),
      inputValue: z.string().min(1, "InputValue is required"),
      description: z.string().optional(),
      attachments: z.array(z.any()).optional(),
    })
  ),
});
