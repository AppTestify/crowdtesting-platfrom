import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { IssueStatus, Severity } from "@/app/_constants/issue";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { Issue } from "@/app/_models/issue.model";
import { Project } from "@/app/_models/project.model";
import { TestCycle } from "@/app/_models/test-cycle.model";
import { TestCase } from "@/app/_models/test-case.model";
import { TestExecution } from "@/app/_models/test-execution.model";
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
    let projects: any[] = [];
    let totalTestCycles: any[] = [];

    // for assign
    let proj, testCycleIds: any[] = [];

    // for inside project
    if (project && project !== "undefined") {
      proj = await Project.findById(project);
      const cycleIds = getTestCycleBasedIds(proj, session.user?._id);
      testCycleIds = cycleIds || [];

      let filter: any =
        testCycleIds?.length > 0 && session.user?.role === UserRoles.TESTER
          ? { "users.testCycles": { $in: testCycleIds } }
          : { _id: project };

      projects = await Project.find(filter);

      totalTestCycles = await TestCycle.find({
        projectId: projects,
        _id: { $in: testCycleIds },
      });
    } else {
      // for all projects
      projects = await Project.find({
        users: {
          $elemMatch: {
            userId: session.user._id,
            $or: [
              { isVerify: { $exists: false } },
              { isVerify: { $ne: false } },
            ],
          },
        },
      });

      projects.forEach((project) => {
        project.users.forEach((user: any) => {
          if (user.isVerify === undefined) {
            user.isVerify = true;
          }
        });
      });
    }

    // for assign method
    let issueFilter: any =
      testCycleIds?.length > 0 &&
      session.user?.role === UserRoles.TESTER
        ? {
            testCycle: { $in: testCycleIds },
            projectId: projects.map((project) => project._id),
          }
        : { projectId: projects.map((project) => project._id) };

    const issues = await Issue.find(issueFilter);

    // Count unique test cycles from issues
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

    const issueCounts = await Issue.find(issueFilter).countDocuments();

    // Get test case count for crowd testers
    let testCaseCount = 0;
    let testExecutionCount = 0;
    if (session.user?.role === UserRoles.CROWD_TESTER) {
      testCaseCount = await TestCase.find({
        projectId: projects.map((project) => project._id),
      }).countDocuments();
      
      // Get test execution count for crowd testers
      testExecutionCount = await TestExecution.find({
        projectId: projects.map((project) => project._id),
      }).countDocuments();
    }

    const { severityCounts, statusCounts } = countresults(issues);
    return Response.json({
      severity: severityCounts,
      status: statusCounts,
      testCycle:
        testCycleIds?.length > 0 && session.user?.role === UserRoles.TESTER
          ? totalTestCycles?.length
          : uniqueTestCycleCount,
      issue: issueCounts,
      totalTestCases: testCaseCount,
      totalTestExecutions: testExecutionCount,
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
