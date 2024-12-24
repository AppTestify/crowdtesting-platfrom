import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import {
  IssueStatus,
  IssueType,
  Priority,
  Severity,
} from "@/app/_constants/issue";
import { connectDatabase } from "@/app/_db";
import { IIssue } from "@/app/_interface/issue";
import { IProject } from "@/app/_interface/project";
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

    const projects = await Project.find({ "users.userId": session.user._id });
    const issues = await Issue.find({
      projectId: projects.map((project) => project._id),
    });

    //
    let completedCount = 0;
    let ongoingCount = 0;

    projects.forEach((project) => {
      const projectIssues = issues.filter((issue) =>
        issue.projectId.equals(project._id)
      );
      const isCompleted = projectIssues.every((issue) =>
        ["success", "retest_passed"].includes(issue.status)
      );

      if (isCompleted) {
        completedCount++;
      } else {
        ongoingCount++;
      }
    });

    const issueCounts = await Issue.find({
      projectId: projects.map((project) => project._id),
    }).countDocuments();
    // const testCycleCounts = await TestCycle.find({ projectId: projects.map((project) => project._id) }).countDocuments();

    const projectCounts = countProjectResults(projects);

    const { severityCounts, statusCounts } = countresults(issues);
    return Response.json({
      severity: severityCounts,
      status: statusCounts,
      project: projectCounts,
      issue: issueCounts,
      ProjectSequence: { completed: completedCount, ongoing: ongoingCount },
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}

function countProjectResults(projects: IProject[]) {
  const statusCounts = {
    active: 0,
    inActive: 0,
  };

  projects.forEach((project) => {
    if (project?.isActive === true) statusCounts.active++;
    else statusCounts.inActive++;
  });

  return statusCounts;
}

function countresults(issue: any[]) {
  const severityCounts: any = {};
  severityCounts[Severity.MINOR] = 0;
  severityCounts[Severity.MAJOR] = 0;
  severityCounts[Severity.CRITICAL] = 0;

  const statusCounts: any = {};
  statusCounts[IssueStatus.REPORTED] = 0;
  statusCounts[IssueStatus.FIXED] = 0;
  statusCounts[IssueStatus.DUPLICATE] = 0;
  statusCounts[IssueStatus.INVALID] = 0;
  statusCounts[IssueStatus.DEFERRED] = 0;
  statusCounts[IssueStatus.RETEST_FAILED] = 0;
  statusCounts[IssueStatus.RETEST_PASSED] = 0;

  issue.forEach((result) => {
    // By severity
    if (result.severity) {
      severityCounts[result.severity]++;
    }

    // By status
    if (result.status) {
      statusCounts[result.status]++;
    }
  });

  return { severityCounts, statusCounts };
}
