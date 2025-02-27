import { DBModels } from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { Issue } from "@/app/_models/issue.model";
import { Project } from "@/app/_models/project.model";
import { getTestCycleBasedIds } from "@/app/_utils/common-server-side";
import { addCustomIds } from "@/app/_utils/data-formatters";
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

    let response = null;
    const { projectId } = params;

    // for assign
    const project = await Project.findById(projectId);
    const testCycleIds = getTestCycleBasedIds(project, session.user?._id);

    let filter: any =
      testCycleIds?.length > 0 && session.user?.role === UserRoles.TESTER
        ? { testCycle: { $in: testCycleIds } }
        : { projectId: projectId };

    const userIdFormat = await IdFormat.findOne({ entity: DBModels.ISSUE });
    response = addCustomIds(
      await Issue.find(filter)
        .populate("userId attachments device projectId")
        .populate({ path: "testCycle", strictPopulate: false })
        .sort({ createdAt: -1 })
        .lean(),
      userIdFormat.idFormat
    );

    return Response.json(response);
  } catch (error: any) {
    return errorHandler(error);
  }
}
