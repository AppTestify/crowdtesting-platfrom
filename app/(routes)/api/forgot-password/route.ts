import { DB_CONNECTION_ERROR_MESSAGE, EMAIL_NOT_FOUND_ERROR, GENERIC_ERROR_MESSAGE, INVALID_INPUT_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { User } from "@/app/_models/user.model";
import { forgotPasswordSchema } from "@/app/_schemas/auth.schema";
import { sendForgotPasswordLink } from "@/app/_utils/email";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    try {
        const isDBConnected = await connectDatabase();
        if (!isDBConnected) {
            return Response.json(
                {
                    message: DB_CONNECTION_ERROR_MESSAGE,
                },
                { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
            );
        }

        const body = await req.json();
        const response = forgotPasswordSchema.safeParse(body);

        if (!response.success) {
            return Response.json(
                {
                    message: INVALID_INPUT_ERROR_MESSAGE,
                },
                { status: HttpStatusCode.BAD_REQUEST }
            );
        }

        const { email } = response.data;
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return Response.json(
                {
                    message: EMAIL_NOT_FOUND_ERROR,
                    status: HttpStatusCode.BAD_REQUEST
                }
            );
        }

        const JWT_SECRET = 'customSecret';
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
        const resetUrl = `${process.env.URL}/auth/reset-password?token=${token}`;
        const emailData = {
            resetLink: resetUrl,
            email: email
        }
        await sendForgotPasswordLink(emailData);

        return Response.json({
            message: "Forgot password link send to your mail",
        });
    } catch (error: any) {
        return Response.json(
            { message: error },
            { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
        );
    }
}