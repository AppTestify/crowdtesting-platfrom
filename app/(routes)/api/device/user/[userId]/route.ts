import { DB_CONNECTION_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { Device } from "@/app/_models/device.model";
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

        const response = await Device.find({ userId: userId }).select("_id name userId version country");

        return Response.json(response);
    } catch (error: any) {
        return errorHandler(error);
    }
}