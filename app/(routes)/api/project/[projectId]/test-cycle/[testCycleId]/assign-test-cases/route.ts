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
import { verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { TestCaseResult } from "@/app/_models/test-case-result.model";
import { TestCycle } from "@/app/_models/test-cycle.model";
import { assignTestCasesSchema } from "@/app/_schemas/test-cycle.schema";
import { addCustomIds, replaceCustomId } from "@/app/_utils/data-formatters";
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

    const checkTestCycleResult = await TestCycle.findById(
      //     {
      // //   testCaseId: { $in: response.data?.testCaseIds },
      //   testCycleId: testCycleId,
      // }
      testCycleId
    );

    const existingTestCaseIds = checkTestCycleResult?.testCases?.map(
      (result: any) => result.toString()
    );
    const newTestCaseIds = response.data?.testCaseIds.filter(
      (testCaseId) => !existingTestCaseIds.includes(testCaseId)
    );

    // if (newTestCaseIds.length > 0) {
    //   testCaseResults = await TestCaseResult.insertMany(
    //     newTestCaseIds.map((testCaseId) => ({
    //       userId: session.user._id,
    //       testCaseId,
    //       testCycleId,
    //     }))
    //   );
    // }
    //  testcycle -> modal
    const existingTestCaseResultIds = checkTestCycleResult?.testCases?.map(
      (result: any) => result.toString()
    );

    const allTestCaseResultIds = [
      ...existingTestCaseResultIds,
      ...newTestCaseIds,
    ];

    await TestCycle.findByIdAndUpdate(
      testCycleId,
      {
        // testCaseResults: allTestCaseResultIds,
        testCases: allTestCaseResultIds,
      },
      { new: true }
    );

    return Response.json({
      message: "test cases assigned successfully",
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
