import { DBModels } from "@/app/_constants";
import { DB_CONNECTION_ERROR_MESSAGE, INVALID_INPUT_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { TestPlan } from "@/app/_models/test-plan.model";
import { testPlanSchema } from "@/app/_schemas/test-plan.schema";
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
        const response = testPlanSchema.safeParse(body);

        if (!response.success) {
            return Response.json(
                {
                    message: INVALID_INPUT_ERROR_MESSAGE,
                    errors: response.error.errors,
                },
                { status: HttpStatusCode.BAD_REQUEST }
            );
        }

        const newTestSuite = new TestPlan({
            ...response.data,
            userId: session.user._id,
        });
        const saveTestSuite = await newTestSuite.save();

        return Response.json({
            message: "Test plan added successfully",
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
        let totalTestPlans;
        const { skip, limit } = serverSidePagination(req);
        const userIdFormat = await IdFormat.findOne({ entity: DBModels.TEST_PLAN });

        if (!(await isAdmin(session.user))) {
            totalTestPlans = await TestPlan.find({ projectId: projectId }).countDocuments();
            response = addCustomIds(
                await TestPlan.find({ projectId: projectId })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit))
                    .lean(),
                userIdFormat.idFormat
            );
        } else {
            response = addCustomIds(
                await TestPlan.find({ projectId: projectId })
                    .populate("userId", "id firstName lastName")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit))
                    .lean(),
                userIdFormat.idFormat
            );
        }

        return Response.json({ "testPlans": response, "total": totalTestPlans });
    } catch (error: any) {
        return errorHandler(error);
    }
}