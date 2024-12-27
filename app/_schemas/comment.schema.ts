import { z } from "zod";

export const CommentSchema = z.object({
    entityId: z.string().min(1, "Entity id is required"),
    entityType: z.string().min(1, "Entity type is required"),
    commentedBy: z.string().min(1, "Comment by is required"),
    content: z.string().min(1, "Content by is required"),
});