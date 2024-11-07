import { DB_CONNECTION_ERROR_MESSAGE, GENERIC_ERROR_MESSAGE, INVALID_INPUT_ERROR_MESSAGE, INVALID_PASSWORD_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { User } from "@/app/_models/user.model";
import { userPasswordSchema } from "@/app/_schemas/users.schema";
import { errorHandler } from "@/app/_utils/error-handler";
import bcrypt from "bcryptjs";

export async function PUT(
    req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const session = await verifySession();

        if (!session) {
            return Response.json(
                { message: USER_UNAUTHORIZED_ERROR_MESSAGE },
                { status: HttpStatusCode.UNAUTHORIZED }
            );
        }

        if (!(await isAdmin(session?.user))) {
            return Response.json(
                { message: USER_UNAUTHORIZED_ERROR_MESSAGE },
                { status: HttpStatusCode.UNAUTHORIZED }
            );
        }

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
        const response = userPasswordSchema.safeParse(body);

        if (!response.success) {
            return Response.json(
                {
                    message: INVALID_INPUT_ERROR_MESSAGE,
                    errors: response.error.errors,
                },
                { status: HttpStatusCode.BAD_REQUEST }
            );
        }

        const userId = session.user._id;
        const existingUser = await User.findById(userId);
        const { password } = response.data;

        const isPasswordValid = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!isPasswordValid) {
            return Response.json(
                { message: INVALID_PASSWORD_ERROR_MESSAGE },
                { status: HttpStatusCode.UNAUTHORIZED }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const updateResponse = await User.findByIdAndUpdate(userId, {
            password: hashedPassword
        });

        if (!updateResponse) {
            throw new Error(GENERIC_ERROR_MESSAGE);
        }

        return Response.json({
            message: "User password updated successfully",
        });
    } catch (error: any) {
        return errorHandler(error);
    }
}