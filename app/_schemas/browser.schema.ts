import { z } from "zod";

export const browserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  logo: z.any().refine((file) => file.size > 0, {
    message: "Logo file is required",
  }),
});
