import { File } from "buffer";
import { z } from "zod";

export const fileSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size <= 15 * 1024 * 1024, {
    message: "Document must be under 15 MB",
  }),
  fileType: z.string().min(1, { message: "File type is required" }),
});
