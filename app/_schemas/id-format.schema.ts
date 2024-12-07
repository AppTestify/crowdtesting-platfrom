import { z } from "zod";

export const IdFormatSchema = z.object({
    entity: z.string().min(1, "Entity is required"),
    idFormat: z.string().min(1, "IdFormat is required"),
});