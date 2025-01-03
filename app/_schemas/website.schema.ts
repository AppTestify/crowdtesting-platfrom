import { File } from "buffer";
import { z } from "zod";

export const websiteSchema = z.object({
  websiteName: z.string().optional(),
  timeZone: z.string().optional(),
});

export const websiteLogoSchema = z.object({
  logo: z
    .instanceof(File)
    .refine((file) => ["image/png", "image/jpeg"].includes(file.type), {
      message: "Image must be a PNG or JPG",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Image must be under 5 MB",
    }),
});
