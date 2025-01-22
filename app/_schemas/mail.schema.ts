import { z } from "zod";

export const MailSchema = z.object({
  emails: z.array(z.string()).min(1, "At least one receiver email is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
});
