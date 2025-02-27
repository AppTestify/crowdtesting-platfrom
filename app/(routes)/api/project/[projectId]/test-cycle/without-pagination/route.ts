import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { Project } from "@/app/_models/project.model";
import { TestCycle } from "@/app/_models/test-cycle.model";
import { getTestCycleBasedIds } from "@/app/_utils/common-server-side";
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
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

    // for tester
    const project = await Project.findById(projectId);
    const testCycleIds = getTestCycleBasedIds(project, session.user?._id);

    const query =
      testCycleIds?.length > 0 && session.user?.role === UserRoles.TESTER
        ? {
            _id: { $in: testCycleIds },
            startDate: { $lte: endOfDay },
            endDate: { $gte: startOfDay },
          }
        : {
            projectId: projectId,
            startDate: { $lte: endOfDay },
            endDate: { $gte: startOfDay },
          };
    const response = await TestCycle.find(query).select("_id title").lean();

    return Response.json(response);
  } catch (error: any) {
    return errorHandler(error);
  }
}
