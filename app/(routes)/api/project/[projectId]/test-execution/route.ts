import { DBModels } from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { TestCaseExecutionResult } from "@/app/_constants/test-case";
import { connectDatabase } from "@/app/_db";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { TestCaseResult } from "@/app/_models/test-case-result.model";
import { TestCycle } from "@/app/_models/test-cycle.model";
import { TestExecution } from "@/app/_models/test-execution.model";
import { filterTestExecutionNotForAdmin } from "@/app/_queries/search-test-execution";
import { testExecutionSchema } from "@/app/_schemas/test-execution.schema";
import { countResults, serverSidePagination } from "@/app/_utils/common-server-side";
import { addCustomIds, replaceCustomId } from "@/app/_utils/data-formatters";
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
    const response = testExecutionSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    // Take a testCyle
    const testCycle = await TestCycle.findById(response.data.testCycle);

    // Create many test case result
    const testCaseResult = await TestCaseResult.insertMany(
      testCycle?.testCases?.map((testCaseId: string) => ({
        userId: session.user._id,
        testCycleId: response.data.testCycle,
        testCaseId: testCaseId,
      }))
    );

    // Create a new test execution with test case result
    const newTestExecution = new TestExecution({
      ...response.data,
      userId: session.user._id,
      testCaseResults: testCaseResult?.map(
        (testCaseResultId) => testCaseResultId?._id
      ),
    });
    const saveTestExecution = await newTestExecution.save();

    await TestCaseResult.updateMany(
      {
        _id: { $in: testCaseResult.map((testCase) => testCase._id) },
      },
      {
        $set: { testExecutionId: saveTestExecution._id },
      }
    );

    return Response.json({
      message: "Test execution added successfully",
      id: saveTestExecution?._id,
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
    const url = new URL(req.url);
    const searchString = url.searchParams.get("searchString");
    const totalTestCycles = await TestExecution.find({
      projectId: projectId,
    }).countDocuments();
    const { skip, limit } = serverSidePagination(req);
    const testExecutionIdFormat = await IdFormat.findOne({
      entity: DBModels.TEST_EXECUTION,
    });

    if (searchString) {
      const { testExecution, totalTestExecutions } =
        await filterTestExecutionNotForAdmin(
          searchString,
          skip,
          limit,
          projectId,
          testExecutionIdFormat
        );

      return Response.json({
        testCycles: addCustomIds(
          testExecution,
          testExecutionIdFormat?.idFormat
        ),
        total: totalTestExecutions,
      });
    }

    if (!(await isAdmin(session.user))) {
      response = addCustomIds(
        await TestExecution.find({ projectId: projectId })
          .populate("testCaseResults testCycle")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        testExecutionIdFormat.idFormat
      );
    } else {
      response = addCustomIds(
        await TestExecution.find({ projectId: projectId })
          .populate("userId", "id firstName lastName")
          .populate("testCaseResults testCycle")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        testExecutionIdFormat.idFormat
      );
    }

    const result = response.map((res) => ({
      ...res,
      resultCounts: countResults(res?.testCaseResults || []),
    }));

    return Response.json({ testCycles: result, total: totalTestCycles });
  } catch (error: any) {
    return errorHandler(error);
  }
}


