import { DBModels } from "@/app/_constants";
import { DB_CONNECTION_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { ITestCaseResult } from "@/app/_interface/test-case-result";
import { verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { TestCase } from "@/app/_models/test-case.model";
import { TestCycle } from "@/app/_models/test-cycle.model";
import { addCustomIds } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";

export async function GET(
    req: Request,
    { params }: { params: { projectId: string, testCycleId: string } }
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

        const { testCycleId } = params;
        const testCaseIdFormat = await IdFormat.findOne({ entity: DBModels.TEST_CASE });

        const testCycle = await TestCycle.findById(testCycleId).populate({
            path: "testCaseResults"
        });
        const testCycleIds = testCycle.testCaseResults?.map((testCaseResult: ITestCaseResult) => testCaseResult.testCaseId);
        const response = addCustomIds(
            await TestCase.find({ _id: { $nin: testCycleIds } }).sort({ createdAt: -1 }).lean(),
            testCaseIdFormat.idFormat
        );

        return Response.json(response);
    } catch (error: any) {
        return errorHandler(error);
    }
}