import { DBModels } from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { ITestCaseResult } from "@/app/_interface/test-case-result";
import { verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { Project } from "@/app/_models/project.model";
import { TestCycle } from "@/app/_models/test-cycle.model";
import { getTestCycleBasedIds } from "@/app/_utils/common-server-side";
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

    const { projectId } = params;
    const testCaseIdFormat = await IdFormat.findOne({
      entity: DBModels.TEST_CASE,
    });
    const requirementIdFormat = await IdFormat.findOne({
      entity: DBModels.REQUIREMENT,
    });

    const project = await Project.findById(projectId);
    const cycleIds = getTestCycleBasedIds(project, session.user?._id);
    const testCycleIds = cycleIds || [];
    const query =
      testCycleIds?.length > 0
        ? { _id: { $in: testCycleIds } }
        : { projectId: projectId };

    const response = await TestCycle.find(query)
      .select("title testCases")
      .populate({
        path: "testCases",
        select: "customId title result testCaseId testSuite requirements",
        strictPopulate: false,
        populate: [
          {
            path: "requirements",
            select: "customId title",
          },
          {
            path: "testSuite",
            select: "title",
          },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    const result = response.map((res) => ({
      ...res,
      testCases: res?.testCases?.map((testCase: ITestCaseResult) => ({
        // test case
        ...testCase,
        customId: replaceCustomId(
          testCaseIdFormat.idFormat,
          testCase?.customId
        ),

        //   requirement customId
        requirements: testCase?.testCaseId?.requirements?.map(
          (requirement) => ({
            ...requirement,
            customId: replaceCustomId(
              requirementIdFormat.idFormat,
              requirement.customId
            ),
          })
        ),
      })),
    }));

    return Response.json(result);
  } catch (error: any) {
    return errorHandler(error);
  }
}
