import { DBModels } from "@/app/_constants";
import { DB_CONNECTION_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { Requirement } from "@/app/_models/requirement.model";
import { addCustomIds, normaliseIds } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";

export async function GET(
    req: Request,
    { params }: { params: { projectId: string } }
) {
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

        const { projectId } = params;
        const requirementIdFormat = await IdFormat.findOne({ entity: DBModels.REQUIREMENT });
        const response = addCustomIds(
            await Requirement.find({ projectId: projectId })
                .populate("projectId", "_id title")
                .select("_id title customId")
                .sort({ createdAt: -1 })
                .lean(),
            requirementIdFormat.idFormat
        );

        return Response.json(response);
    } catch (error: any) {
        return errorHandler(error);
    }
}