import { z } from "zod";

export const profilePictureSchema = z.object({
    profileImage: z
        .instanceof(File)
        .refine((file) => ["image/png", "image/jpeg"].includes(file.type), {
            message: "Image must be a PNG or JPG",
        })
        .refine((file) => file.size <= 15 * 1024 * 1024, {
            message: "Image must be under 15 MB",
        })
});