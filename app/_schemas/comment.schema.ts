import { z } from "zod";

export const CommentSchema = z.object({
  entityId: z.string().min(1, "Entity id is required"),
  content: z.string().min(1, "Content by is required"),
});
