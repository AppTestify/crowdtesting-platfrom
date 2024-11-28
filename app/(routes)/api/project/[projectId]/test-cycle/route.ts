import { DBModels } from "@/app/_constants";
import { DB_CONNECTION_ERROR_MESSAGE, INVALID_INPUT_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { TestCycle } from "@/app/_models/test-cycle.model";
import { testCycleSchema } from "@/app/_schemas/test-cycle.schema";
import { serverSidePagination } from "@/app/_utils/common-server-side";
import { addCustomIds } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";

export async function POST(
    req: Request,
    { params }: { params: { projectId: string } }
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

        const body = await req.json();
        const response = testCycleSchema.safeParse(body);

        if (!response.success) {
            return Response.json(
                {
                    message: INVALID_INPUT_ERROR_MESSAGE,
                    errors: response.error.errors,
                },
                { status: HttpStatusCode.BAD_REQUEST }
            );
        }

        const newTestSuite = new TestCycle({
            ...response.data,
            userId: session.user._id,
        });
        const saveTestSuite = await newTestSuite.save();

        return Response.json({
            message: "Test cycle added successfully",
            id: saveTestSuite?._id,
        });

    } catch (error: any) {
        return errorHandler(error);
    }
}

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

        let response = null;
        const { projectId } = params;
        const totalTestCycles = await TestCycle.find({ projectId: projectId }).countDocuments();
        const { skip, limit } = serverSidePagination(req);
        const userIdFormat = await IdFormat.findOne({ entity: DBModels.TEST_CYCLE });
        if (!(await isAdmin(session.user))) {
            response = addCustomIds(
                await TestCycle.find({ projectId: projectId })
                    .populate("testCaseId")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit))
                    .lean(),
                userIdFormat.idFormat
            );
        } else {
            response = addCustomIds(
                await TestCycle.find({ projectId: projectId })
                    .populate("userId", "id firstName lastName")
                    .populate("testCaseId")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit))
                    .lean(),
                userIdFormat.idFormat
            );
        }

        return Response.json({ "testCycles": response, "total": totalTestCycles });
    } catch (error: any) {
        return errorHandler(error);
    }
}