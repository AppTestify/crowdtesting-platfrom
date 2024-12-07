import { DB_CONNECTION_ERROR_MESSAGE, INVALID_INPUT_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { SupportEmail } from "@/app/_models/support-email.model";
import { User } from "@/app/_models/user.model";
import { adminEmailSchema } from "@/app/_schemas/admin.schema";
import { errorHandler } from "@/app/_utils/error-handler";

export async function GET(req: Request) {
    try {
        const session = await verifySession();
        if (!session || !session.isAuth) {
            return Response.json(
                { message: USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE },
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

        const response = await User.find({ role: UserRoles.ADMIN }).select("_id email")

        return Response.json(response);
    } catch (error: any) {
        return errorHandler(error);
    }
}

export async function POST(req: Request) {
    try {
        const session = await verifySession();

        if (!session) {
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
        const response = adminEmailSchema.safeParse(body);

        if (!response.success) {
            return Response.json(
                {
                    message: INVALID_INPUT_ERROR_MESSAGE,
                    errors: response.error.errors,
                },
                { status: HttpStatusCode.BAD_REQUEST }
            );
        }

        const supportEmail = await SupportEmail.findOne();
        if (supportEmail) {
            await SupportEmail.findByIdAndUpdate(supportEmail._id,
                { emails: response.data.emails },
                { new: true }
            )
        } else {
            const saveSupportEmails = new SupportEmail({
                emails: response.data.emails
            })
            saveSupportEmails.save();
        }

        return Response.json({
            message: "Support email updated successfully",
        });
    } catch (error: any) {
        return errorHandler(error);
    }
}