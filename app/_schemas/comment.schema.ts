import { z } from "zod";

export const CommentSchema = z.object({
  entityId: z.string().min(1, "Entity id is required"),
  entityType: z.string().optional(),
  content: z.string().min(1, "Content by is required"),
  isVerify: z.boolean().optional(),
});

export const CommentVerifySchema = z.object({
  isVerify: z.boolean(),
});
