import { DB_CONNECTION_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { Device } from "@/app/_models/device.model";
import { normaliseIds } from "@/app/_utils/data-formatters";
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

        let response = null;
        if (!(await isAdmin(session.user))) {
            response = normaliseIds(
                await Device.find({ userId: session.user._id })
                    .sort({ createdAt: -1 })
                    .lean()
            );
        } else {
            response = normaliseIds(
                await Device.find({})
                    .populate("userId", "email firstName lastName isActive")
                    .sort({ createdAt: -1 })
                    .lean()
            );
        }

        return Response.json(response);
    } catch (error: any) {
        return errorHandler(error);
    }
}