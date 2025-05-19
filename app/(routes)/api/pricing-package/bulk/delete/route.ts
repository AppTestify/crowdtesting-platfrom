import { DB_CONNECTION_ERROR_MESSAGE, GENERIC_ERROR_MESSAGE, INVALID_INPUT_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { Package } from "@/app/_models/package.model";
import { pricingBulkDeleteSchema } from "@/app/_schemas/package.schema";

import { errorHandler } from "@/app/_utils/error-handler";

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
        const response = pricingBulkDeleteSchema.safeParse(body);

        if (!response.success) {
            return Response.json(
                {
                    message: INVALID_INPUT_ERROR_MESSAGE,
                    errors: response.error.errors,
                },
                { status: HttpStatusCode.BAD_REQUEST }
            );
        }

        const { ids } = response.data;
        const query = { _id: { $in: ids } };

        const deleteResult = await Package.deleteMany(query);

        if (!deleteResult || !deleteResult?.deletedCount) {
            return Response.json(
                {
                    message: GENERIC_ERROR_MESSAGE,
                },
                { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
            );
        }

        return Response.json({
            message: "Package deleted successfully",
        });

    } catch (error: any) {
        return errorHandler(error);
    }
}