import { DBModels } from "@/app/_constants";
import { DB_CONNECTION_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { TestCaseData } from "@/app/_models/test-case-data";
import { TestCaseResult } from "@/app/_models/test-case-result.model";
import { TestCaseStep } from "@/app/_models/test-case-step.model";
import { serverSidePagination } from "@/app/_utils/common-server-side";
import { addCustomIds, replaceCustomId } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";

export async function GET(
    req: Request,
    { params }: { params: { testCycleId: string } }
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

        const url = new URL(req.url);
        const { testCycleId } = params;
        const result = url.searchParams.get("result");
        const filter: any = { testCycleId: testCycleId };
        if (result) {
            filter.result = result;
        }
        const { skip, limit } = serverSidePagination(req);

        const userIdFormat = await IdFormat.findOne({ entity: DBModels.TEST_CASE });
        const testCycleIdFormat = await IdFormat.findOne({ entity: DBModels.TEST_CYCLE });
        const response = await TestCaseResult.find(filter)
            .populate("testCycleId", "_id customId title")
            .populate("testCaseId")
            .skip(skip)
            .limit(Number(limit))
            .lean();
        const totalTestExecutionCounts = await TestCaseResult.find(filter).countDocuments();

        const testCaseIds = response.map((res) => res.testCaseId?._id);
        const testCaseStep = await TestCaseStep.find({ testCaseId: { $in: testCaseIds } }).sort({ order: 1 }).lean();
        const testCaseData = await TestCaseData.find({ testCaseId: { $in: testCaseIds } }).lean();

        const allData = response.map((res) => {
            const customIdFormatted = replaceCustomId(userIdFormat.idFormat, res?.testCaseId?.customId);

            const stepsForTestCase = testCaseStep.filter(step => step.testCaseId.toString() === res.testCaseId._id.toString());
            const dataForTestCase = testCaseData.filter(data => data.testCaseId.toString() === res.testCaseId._id.toString());

            return {
                ...res,
                testCaseId: {
                    ...res?.testCaseId,
                    customId: customIdFormatted
                },
                testCycleId: {
                    ...res?.testCycleId,
                    customId: replaceCustomId(testCycleIdFormat.idFormat, res?.testCycleId?.customId)
                },
                testCaseStep: stepsForTestCase,
                testCaseData: dataForTestCase
            };
        });

        return Response.json({ "testExecution": allData, "total": totalTestExecutionCounts });
    } catch (error: any) {
        return errorHandler(error);
    }
}