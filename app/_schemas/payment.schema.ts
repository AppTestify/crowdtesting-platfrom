import { z } from "zod";

export const paymentSchema = z.object({
    receiverId: z
        .string()
        .min(1, "Required"),
    amount: z
        .preprocess(
            (value) => (value === null || value === undefined ? undefined : value),
            z
                .number({ required_error: "Required" })
                .positive("Amount must be a positive number")
        ),
    projectId: z.string().optional(),
    description: z.string().optional(),
    status: z.string().optional(),
    senderId: z.string().optional()
});