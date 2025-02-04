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
  TaskStatus,
} from "@/app/_constants/issue";
import { connectDatabase } from "@/app/_db";
import { IProject } from "@/app/_interface/project";
import { ITask } from "@/app/_interface/task";
import { verifySession } from "@/app/_lib/dal";
import { Issue } from "@/app/_models/issue.model";
import { Project } from "@/app/_models/project.model";
import { Task } from "@/app/_models/task.model";
import { TestCycle } from "@/app/_models/test-cycle.model";
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
      projects = await Project.find({
        deletedAt: { $exists: false },
        $or: [
          { "users.userId": session.user._id },
          { userId: session.user._id },
        ],
      });
    }
    const issues = await Issue.find({
      projectId: projects.map((project) => project._id),
    });

    const topDevices = await topDevicesData(projects);
    const testCycleCounts = await TestCycle.find({
      projectId: projects.map((project) => project._id),
    }).countDocuments();

    const projectCounts = countProjectResults(projects);

    const { severityCounts, priorityCounts, statusCounts, issueTypeCounts } =
      countresults(issues);

    // task by status
    const tasks = await Task.find({
      projectId: projects.map((project) => project._id),
    });
    const taskCounts = countTaskByStatus(tasks);

    return Response.json({
      severity: severityCounts,
      priority: priorityCounts,
      status: statusCounts,
      issueType: issueTypeCounts,
      project: projectCounts,
      topDevices: topDevices,
      totalTestCycle: testCycleCounts,
      totalProjects: projects.length,
      totalIssues: issues.length,
      task: taskCounts,
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

function countTaskByStatus(tasks: ITask[]) {
  const taskCounts: any = {};
  taskCounts[TaskStatus.TODO] = 0;
  taskCounts[TaskStatus.IN_PROGRESS] = 0;
  taskCounts[TaskStatus.BLOCKED] = 0;
  taskCounts[TaskStatus.DONE] = 0;

  tasks.forEach((task) => {
    // if (project?.isActive === true) statusCounts.active++;
    // else statusCounts.inActive++;
    if (task.status) {
      taskCounts[task.status]++;
    }
  });

  return taskCounts;
}

function countresults(issue: any[]) {
  const severityCounts: any = {};
  severityCounts[Severity.MINOR] = 0;
  severityCounts[Severity.MAJOR] = 0;
  severityCounts[Severity.CRITICAL] = 0;
  severityCounts[Severity.BLOCKER] = 0;

  const priorityCounts: any = {};
  priorityCounts[Priority.LOW] = 0;
  priorityCounts[Priority.NORMAL] = 0;
  priorityCounts[Priority.HIGH] = 0;

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

  const issueTypeCounts: any = {};
  issueTypeCounts[IssueType.FUNCTIONAL] = 0;
  issueTypeCounts[IssueType.UI_UX] = 0;
  issueTypeCounts[IssueType.USABILITY] = 0;
  issueTypeCounts[IssueType.PERFORMANCE] = 0;
  issueTypeCounts[IssueType.SECURITY] = 0;

  issue.forEach((result) => {
    // By severity
    if (result.severity) {
      severityCounts[result.severity]++;
    }

    // By priority
    if (result.priority) {
      priorityCounts[result.priority]++;
    }

    // By status
    if (result.status) {
      statusCounts[result.status]++;
    }
    // By issue type
    if (result.issueType) {
      issueTypeCounts[result.issueType]++;
    }
  });

  return { severityCounts, priorityCounts, statusCounts, issueTypeCounts };
}

async function topDevicesData(projects: IProject[]) {
  const topDevices = await Issue.aggregate([
    {
      $match: {
        projectId: { $in: projects.map((project) => project?._id) },
      },
    },
    {
      $group: {
        _id: "$device",
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "devices",
        localField: "_id",
        foreignField: "_id",
        as: "deviceDetails",
      },
    },
    {
      $unwind: "$deviceDetails",
    },
    {
      $project: {
        _id: 1,
        count: 1,
        name: "$deviceDetails.name",
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  return topDevices;
}
