import { DBModels } from "@/app/_constants";
import { DB_CONNECTION_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { ITestCaseResult } from "@/app/_interface/test-case-result";
import { verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { TestCycle } from "@/app/_models/test-cycle.model";
import { replaceCustomId } from "@/app/_utils/data-formatters";
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

        const testCaseIdFormat = await IdFormat.findOne({ entity: DBModels.TEST_CASE });
        const { projectId } = params;
        const response = await TestCycle.find({ projectId: projectId })
            .populate({
                path: "testCaseResults",
                populate: (
                    "testCaseId"
                )
            })
            .sort({ createdAt: -1 })
            .lean();

        const result = response.map((res) => ({
            ...res,
            testCaseResults: res?.testCaseResults?.map((testCase: ITestCaseResult) => ({
                ...testCase,
                testCaseId: {
                    ...testCase?.testCaseId,
                    customId: replaceCustomId(testCaseIdFormat.idFormat, testCase?.testCaseId?.customId),
                },
            }))
        }));

        return Response.json(result);
    } catch (error: any) {
        return errorHandler(error);
    }
}