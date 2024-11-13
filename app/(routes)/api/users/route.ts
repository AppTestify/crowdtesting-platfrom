import { DB_CONNECTION_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { User } from "@/app/_models/user.model";
import { serverSidePagination } from "@/app/_utils/common-server-side";
import { normaliseIds } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";


export async function GET(req: Request) {
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

        // Filter by role and status
        const url = new URL(req.url);
        const role = url.searchParams.get("role");
        const status = url.searchParams.get("status");
        const filter: any = { _id: { $ne: session.user._id } };
        if (role) {
            filter.role = role;
        }
        if (status) {
            filter.isActive = status;
        }

        const { skip, limit } = serverSidePagination(req);
        const response = normaliseIds(
            await User.find(filter)
                .populate("profilePicture")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean()
        );
        const totalUsers = await User.countDocuments(filter);
        return Response.json({ "users": response, "total": totalUsers });
    } catch (error: any) {
        return errorHandler(error);
    }
}