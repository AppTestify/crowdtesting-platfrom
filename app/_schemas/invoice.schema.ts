import { z } from "zod";
import { File } from "buffer";

export const invoiceSchema = z.object({
  file: z.instanceof(File),
});
