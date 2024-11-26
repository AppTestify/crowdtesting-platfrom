import { DB_CONNECTION_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { TestCaseStep } from "@/app/_models/test-case-step.model";
import { testCaseStepSchema, testCaseStepSequenceSchema } from "@/app/_schemas/test-case-step.schema";
import { errorHandler } from "@/app/_utils/error-handler";
import { z } from "zod";

export async function PUT(
    req: Request,
    { params }: { params: { projectId: string, testCaseId: string } }
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

        const testCaseStepsSchema = z.array(testCaseStepSequenceSchema);

        const body = await req.json();
        const result = testCaseStepsSchema.safeParse(body);

        if (!result.success) {
            return new Response(JSON.stringify({ error: result.error.issues }), { status: 400 });
        }

        const updatedSteps = result.data;

        for (let i = 0; i < updatedSteps.length; i++) {
            const step = updatedSteps[i];
            await TestCaseStep.findByIdAndUpdate(step._id, { order: i });
        }
        return Response.json({
            message: "Test case step sequence reordered",
        });

    } catch (error: any) {
        return errorHandler(error);
    }
}
