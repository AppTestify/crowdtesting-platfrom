import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { Priority, Severity } from "@/app/_constants/issue";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { Issue } from "@/app/_models/issue.model";
import { Project } from "@/app/_models/project.model";
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

    if (
      project &&
      project !== "undefined" &&
      project !== "" 
    //   &&
    //   !UserRoles.CLIENT
    ) {
      projects = await Project.find({ _id: project });
    } else if (UserRoles.CLIENT) {
      projects = await Project.find({
        $or: [
          { "users.userId": session.user._id },
          { userId: session.user._id },
        ],
      });
    } else {
      projects = await Project.find({});
    }

    let filter: any = {
      projectId: projects.map((project) => project._id),
    };

    if (status) {
      filter.status = status;
    }

    const issues = await Issue.find(filter);

    const { priorityCounts } = countresults(issues);
    return Response.json(priorityCounts);
  } catch (error: any) {
    return errorHandler(error);
  }
}

function countresults(issue: any[]) {
  const priorityCounts: any = {};
  priorityCounts[Priority.LOW] = 0;
  priorityCounts[Priority.NORMAL] = 0;
  priorityCounts[Priority.HIGH] = 0;

  issue.forEach((result) => {
    // By priority
    if (result.priority) {
      priorityCounts[result.priority]++;
    }
  });

  return { priorityCounts };
}
