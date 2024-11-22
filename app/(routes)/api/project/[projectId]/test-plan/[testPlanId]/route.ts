import { DB_CONNECTION_ERROR_MESSAGE, GENERIC_ERROR_MESSAGE, INVALID_INPUT_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { TestPlan } from "@/app/_models/test-plan.model";
import { testPlanSchema } from "@/app/_schemas/test-plan.schema";
import { errorHandler } from "@/app/_utils/error-handler";

export async function DELETE(
    req: Request,
    { params }: { params: { testPlanId: string } }
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

        const { testPlanId } = params;
        const response = await TestPlan.findByIdAndDelete(testPlanId);

        if (!response) {
            throw new Error(GENERIC_ERROR_MESSAGE);
        }

        return Response.json({ message: "Test plan deleted successfully" });
    } catch (error: any) {
        return errorHandler(error);
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { testPlanId: string } }
) {
    try {
        const session = await verifySession();
        if (!session) {
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

        const { testPlanId } = params
        const updateResponse = await TestPlan.findByIdAndUpdate(testPlanId, {
            ...response.data
        });

        if (!updateResponse) {
            throw new Error(GENERIC_ERROR_MESSAGE);
        }

        return Response.json({
            message: "Test plan updated successfully"
        })
    } catch (error: any) {
        return errorHandler(error);
    }
}