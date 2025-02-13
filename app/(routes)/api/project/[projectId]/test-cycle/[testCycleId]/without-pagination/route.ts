import { DBModels } from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { TestCase } from "@/app/_models/test-case.model";
import { TestCycle } from "@/app/_models/test-cycle.model";
import { replaceCustomId } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";

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

    const response = await TestCycle.findById(testCycleId)
      .populate({
        path: "testCases",
        strictPopulate: false,
      })
      .lean();

    const existingTestCaseIds = Array.isArray(response)
      ? []
      : response?.testCases?.map((tc: any) => tc._id.toString());

    const missingTestCases = await TestCase.find({
      _id: { $nin: existingTestCaseIds },
    }).lean();

    const data = {
      ...response,
      testCases: missingTestCases.map((tc) => ({
        ...tc,
        customId: replaceCustomId(testCaseIdFormat.idFormat, tc.customId),
      })),
    };

    return Response.json(data);
  } catch (error: any) {
    return errorHandler(error);
  }
}
