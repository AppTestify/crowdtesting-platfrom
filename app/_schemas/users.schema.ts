import { z } from "zod";

export const userRoleUpdateSchema = z.object({
  _id: z.string(),
  role: z.string(),
});
