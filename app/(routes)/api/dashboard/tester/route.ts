import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import {
  IssueStatus,
  Severity,
} from "@/app/_constants/issue";
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
    let projects;

    if (project && project !== "undefined") {
      projects = await Project.find({ _id: project });
    } else {
      projects = await Project.find({ "users.userId": session.user._id });
    }

    const issues = await Issue.find({
      projectId: projects.map((project) => project._id),
    });

    const testCycleMap = issues.reduce((acc, issue) => {
      const testCycle =
        typeof issue.testCycle === "string"
          ? issue.testCycle.trim().toLowerCase()
          : String(issue.testCycle || "");
      if (testCycle) {
        acc[testCycle] = (acc[testCycle] || 0) + 1;
      }
      return acc;
    }, {});

    const uniqueTestCycleCount = Object.keys(testCycleMap).length;

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

    const { severityCounts, statusCounts } = countresults(issues);
    return Response.json({
      severity: severityCounts,
      status: statusCounts,
      testCycle: uniqueTestCycleCount,
      issue: issueCounts,
      ProjectSequence: { completed: completedCount, ongoing: ongoingCount },
    });
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

  const statusCounts: any = {};
  statusCounts[IssueStatus.NEW] = 0;
  statusCounts[IssueStatus.OPEN] = 0;
  statusCounts[IssueStatus.ASSIGNED] = 0;
  statusCounts[IssueStatus.IN_PROGRESS] = 0;
  statusCounts[IssueStatus.FIXED] = 0;
  statusCounts[IssueStatus.READY_FOR_RETEST] = 0;
  statusCounts[IssueStatus.RETESTING] = 0;
  statusCounts[IssueStatus.VERIFIED] = 0;
  statusCounts[IssueStatus.CLOSED] = 0;
  statusCounts[IssueStatus.REOPENED] = 0;
  statusCounts[IssueStatus.DEFERRED] = 0;
  statusCounts[IssueStatus.DUPLICATE] = 0;
  statusCounts[IssueStatus.REJECTED] = 0;
  statusCounts[IssueStatus.CANNOT_REPRODUCE] = 0;
  statusCounts[IssueStatus.NOT_A_BUG] = 0;
  statusCounts[IssueStatus.BLOCKED] = 0;

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
