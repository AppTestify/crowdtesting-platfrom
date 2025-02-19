import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { Issue } from "@/app/_models/issue.model";
import { TestCaseResult } from "@/app/_models/test-case-result.model";
import { TestCycle } from "@/app/_models/test-cycle.model";
import { unAssignTestCasesSchema } from "@/app/_schemas/test-cycle.schema";
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
    const response = unAssignTestCasesSchema.safeParse(body);

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
    const { testCaseIds, isSingleDelete, testCases } = response.data;
    let TestCaseResultIds;
    let TestCaseResults;

    if (isSingleDelete) {
      TestCaseResults = await TestCaseResult.find({
        testCaseId: testCaseIds,
        testCycleId: testCycleId,
      });
      TestCaseResultIds = TestCaseResults.map(
        (TestCaseResult) => TestCaseResult._id
      );
      await TestCaseResult.deleteMany({
        testCaseId: testCaseIds,
        testCycleId: testCycleId,
      });
    } else {
      TestCaseResults = await TestCaseResult.find({ _id: testCaseIds });
      await TestCaseResult.deleteMany({ _id: testCaseIds });
    }

    const testCaseIssueId = TestCaseResults?.map(
      (TestCaseResult) => TestCaseResult.issueId
    );
    await Issue.deleteMany({ _id: testCaseIssueId });

    await TestCycle.findByIdAndUpdate(
      testCycleId,
      {
        $pull: {
          testCaseResults: {
            $in: isSingleDelete ? TestCaseResultIds : testCaseIds,
          },
          testCases: {
            $in: isSingleDelete ? testCaseIds : testCases,
          },
        },
      },
      { new: true }
    );

    return Response.json({
      message: "Test cases unassigned successfully",
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}
