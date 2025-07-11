import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { Severity } from "@/app/_constants/issue";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { Issue } from "@/app/_models/issue.model";
import { Project } from "@/app/_models/project.model";
import { getTestCycleBasedIds } from "@/app/_utils/common-server-side";
import { errorHandler } from "@/app/_utils/error-handler";

export async function GET(req: Request) {
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
    const project = url.searchParams.get("project");
    const status = url.searchParams.get("status");
    let projects;

    // for assign users
    let testCycleIds: any[] = [], proj;

    if (project && project !== "undefined" && project !== "") {
      proj = await Project.findById(project);
      const cycleIds = getTestCycleBasedIds(proj, session.user?._id);
      testCycleIds = cycleIds || [];

      projects = await Project.find({ _id: project });
    } else if (UserRoles.CLIENT) {
      projects = await Project.find({
        deletedAt: { $exists: false },
        $or: [
          { "users.userId": session.user._id },
          { userId: session.user._id },
        ],
      });
    } else {
      projects = await Project.find({});
    }

    let filter: any =
      testCycleIds?.length > 0 &&
      session.user?.role === UserRoles.TESTER
        ? {
            testCycle: { $in: testCycleIds },
            projectId: projects.map((project) => project._id),
          }
        : { projectId: projects.map((project) => project._id) };

    if (status) {
      filter.status = status;
    }

    const issues = await Issue.find(filter);

    const { severityCounts } = countresults(issues);
    return Response.json(severityCounts);
  } catch (error: any) {
    return errorHandler(error);
  }
}

function countresults(issue: any[]) {
  const severityCounts: any = {};
  severityCounts[Severity.MINOR] = 0;
  severityCounts[Severity.MAJOR] = 0;
  severityCounts[Severity.CRITICAL] = 0;
  severityCounts[Severity.BLOCKER] = 0;

  issue.forEach((result) => {
    // By severity
    if (result.severity) {
      severityCounts[result.severity]++;
    }

    // By status
  });

  return { severityCounts };
}
