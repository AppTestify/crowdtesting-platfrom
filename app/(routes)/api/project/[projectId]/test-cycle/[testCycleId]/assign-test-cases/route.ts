import { DBModels } from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { ITestCycle } from "@/app/_interface/test-cycle";
import { ITestExecution } from "@/app/_interface/test-execution";
import { verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { TestCaseResult } from "@/app/_models/test-case-result.model";
import { TestCycle } from "@/app/_models/test-cycle.model";
import { TestExecution } from "@/app/_models/test-execution.model";
import { assignTestCasesSchema } from "@/app/_schemas/test-cycle.schema";
import { replaceCustomId } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";

export async function PATCH(
  req: Request,
  { params }: { params: { testCycleId: string } }
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
    const response = assignTestCasesSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const { testCycleId } = params;

    const checkTestCycleResult = await TestCycle.findById(testCycleId);

    const existingTestCaseIds = Array.isArray(checkTestCycleResult?.testCases)
      ? checkTestCycleResult?.testCases.map((result: any) => result.toString())
      : [];

    const newTestCaseIds = response.data?.testCaseIds.filter(
      (testCaseId) => !existingTestCaseIds?.includes(testCaseId)
    );

    //  testcycle -> modal
    const existingTestCaseResultIds = Array.isArray(
      checkTestCycleResult?.testCases
    )
      ? checkTestCycleResult?.testCases?.map((result: any) => result.toString())
      : [];

    // New test case result
    const testExecutions = await TestExecution.find({
      testCycle: testCycleId,
    }).populate({ path: "testCaseResults", populate: { path: "testCaseId" } });

    // Add new test case result
    const testCase = await TestCaseResult.insertMany(
      testExecutions.flatMap((testExecution: ITestExecution) =>
        newTestCaseIds.map((testCaseId: string) => ({
          userId: session.user._id,
          testCycleId: testCycleId,
          testCaseId: testCaseId,
          testExecutionId: testExecution._id,
        }))
      )
    );

    // After added new test case result, update test execution
    if (testCase.length > 0) {
      await Promise.all(
        testCase.map(async (tc) => {
          await TestExecution.updateOne(
            { _id: tc.testExecutionId }, 
            { $push: { testCaseResults: tc._id } }
          );
        })
      );
    }

    const allTestCaseResultIds = [
      ...existingTestCaseResultIds,
      ...newTestCaseIds,
    ];

    try {
      await TestCycle.findOneAndUpdate(
        { _id: testCycleId },
        { testCases: allTestCaseResultIds },
        { new: true }
      );
    } catch (error: any) {
      console.error("Error updating test cycle:", error);
      return Response.json({
        message: "Error updating test cycle",
        error: error.message,
      });
    }

    return Response.json({
      message: "Test cases assigned successfully",
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function GET(
  req: Request,
  { params }: { params: { projectId: string; testCycleId: string } }
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
    const testCaseIdFormat = await IdFormat.findOne({
      entity: DBModels.TEST_CASE,
    });

    const testCycle = (await TestCycle.findById(testCycleId)
      .populate({
        path: "testCases",
        strictPopulate: false,
      })
      .sort({ createdAt: -1 })
      .lean()) as ITestCycle | null;

    if (testCycle && testCycle.testCases) {
      testCycle.testCases = testCycle.testCases.map((testCase) => ({
        ...testCase,
        customId: replaceCustomId(testCaseIdFormat.idFormat, testCase.customId),
      }));
    }

    return Response.json(testCycle);
  } catch (error: any) {
    return errorHandler(error);
  }
}
