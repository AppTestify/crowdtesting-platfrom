import { DB_CONNECTION_ERROR_MESSAGE, GENERIC_ERROR_MESSAGE, INVALID_INPUT_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { TestCaseStep } from "@/app/_models/test-case-step.model";
import { testCaseStepSchema } from "@/app/_schemas/test-case-step.schema";
import { errorHandler } from "@/app/_utils/error-handler";

export async function PUT(
    req: Request,
    { params }: { params: { projectId: string, testCaseId: string, testCaseStepId: string } }
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
        const response = testCaseStepSchema.safeParse(body);

        if (!response.success) {
            return Response.json(
                {
                    message: INVALID_INPUT_ERROR_MESSAGE,
                    errors: response.error.errors,
                },
                { status: HttpStatusCode.BAD_REQUEST }
            );
        }

        const { projectId, testCaseId, testCaseStepId } = params
        const updateResponse = await TestCaseStep.findByIdAndUpdate(testCaseId, {
            ...response.data,
            projectId: projectId,
            testCaseStepId: testCaseStepId

        });

        if (!updateResponse) {
            throw new Error(GENERIC_ERROR_MESSAGE);
        }

        return Response.json({
            message: "Test case step updated successfully"
        })
    } catch (error: any) {
        return errorHandler(error);
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { testCaseStepId: string } }
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

        const { testCaseStepId } = params;
        const response = await TestCaseStep.findByIdAndDelete(testCaseStepId);

        if (!response) {
            throw new Error(GENERIC_ERROR_MESSAGE);
        }

        return Response.json({ message: "Test case step deleted successfully" });
    } catch (error: any) {
        return errorHandler(error);
    }
}