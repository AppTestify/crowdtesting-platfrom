import { DB_CONNECTION_ERROR_MESSAGE, GENERIC_ERROR_MESSAGE, USER_EXISTS_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import SendCredentials from "@/app/_helpers/sendEmailCredentials.helper";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { User } from "@/app/_models/user.model";
import { errorHandler } from "@/app/_utils/error-handler";

export async function GET(
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

        const { userId } = params;
        const user = await User.findById(userId);

        const emailCredentials = new SendCredentials();
        const hashedPassword = await emailCredentials.sendEmailCredentials({
            email: user.email,
            role: user.role,
            sendCredentials: true
        });
        const updateResponse = await User.findByIdAndUpdate(userId, {
            password: hashedPassword,
            credentialsSentAt: new Date()
        }, { new: true });

        if (!updateResponse) {
            throw new Error(GENERIC_ERROR_MESSAGE);
        }

        return Response.json({
            message: "user credentials send successfully",
        });

    } catch (error: any) {
        return errorHandler(error);
    }
}