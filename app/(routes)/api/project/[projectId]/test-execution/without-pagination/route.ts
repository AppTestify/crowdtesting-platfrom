import { DBModels } from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { ITestCaseResult } from "@/app/_interface/test-case-result";
import { ITestExecution } from "@/app/_interface/test-execution";
import { verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { TestExecution } from "@/app/_models/test-execution.model";
import { addCustomIds, replaceCustomId } from "@/app/_utils/data-formatters";
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
    const testExecutionIdFormat = await IdFormat.findOne({
      entity: DBModels.TEST_EXECUTION,
    });

    const response = addCustomIds(
      await TestExecution.find({ projectId: projectId })
        .populate("testCycle")
        .populate({
          path: "testCaseResults",
          select: "testCaseId testExecutionId result",
          populate: {
            path: "testCaseId",
            select: "customId testSuite title",
            populate: [
              {
                path: "requirements",
                select: "customId title",
              },
              { path: "testSuite", select: "title" },
            ],
          },
        })
        .sort({ createdAt: -1 })
        .lean(),
      testExecutionIdFormat.idFormat
    );

    const testCaseIdFormat = await IdFormat.findOne({
      entity: DBModels.TEST_CASE,
    });
    const requirementIdFormat = await IdFormat.findOne({
      entity: DBModels.REQUIREMENT,
    });

    // Take a test case custom id
    const result = response.map((res) => ({
      ...res,
      testCaseResults: res?.testCaseResults?.map(
        (testCaseResult: ITestCaseResult) => ({
          ...testCaseResult,
          testCaseId: {
            ...testCaseResult.testCaseId,
            customId: replaceCustomId(
              testCaseIdFormat.idFormat,
              testCaseResult.testCaseId.customId
            ),
            requirements: Array.isArray(testCaseResult.testCaseId?.requirements)
              ? testCaseResult.testCaseId.requirements.map((req) => ({
                  ...req,
                  customId: replaceCustomId(
                    requirementIdFormat.idFormat,
                    req.customId
                  ),
                }))
              : [],
          },
        })
      ),
    }));

    return Response.json(result);
  } catch (error: any) {
    return errorHandler(error);
  }
}
