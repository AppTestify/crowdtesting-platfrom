import { z } from "zod";

export const invoiceSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size <= 15 * 1024 * 1024, {
    message: "Document must be under 15 MB",
  }),
});
