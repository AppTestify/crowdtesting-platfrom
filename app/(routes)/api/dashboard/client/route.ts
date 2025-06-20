import { DBModels } from "@/app/_constants";
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
import { TEST_CASE_SEVERITY, TEST_TYPE } from "@/app/_constants/test-case";
import { connectDatabase } from "@/app/_db";
import { IProject } from "@/app/_interface/project";
import { IRequirement } from "@/app/_interface/requirement";
import { ITask } from "@/app/_interface/task";
import { ITestCase } from "@/app/_interface/test-case";
import { verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { Issue } from "@/app/_models/issue.model";
import { Project } from "@/app/_models/project.model";
import { Requirement } from "@/app/_models/requirement.model";
import { Task } from "@/app/_models/task.model";
import { TestCase } from "@/app/_models/test-case.model";
import { TestCycle } from "@/app/_models/test-cycle.model";
import { User } from "@/app/_models/user.model";
import { replaceCustomId } from "@/app/_utils/data-formatters";
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

    const requirements = await Requirement.find({
      projectId: projects.map((project) => project._id),
    }).sort({ _id: -1 });

    const topDevices = await topDevicesData(projects);
    const testCycleCounts = await TestCycle.find({
      projectId: projects.map((project) => project._id),
    }).countDocuments();

    const projectCounts = countProjectResults(projects);

    // Total test case
    const testCases = await TestCase.find({
      projectId: projects.map((project) => project._id),
    });

    const {
      severityCounts,
      priorityCounts,
      statusCounts,
      issueTypeCounts,
      requirementStatusCounts,
      assignedIssueCountsArray,
      testCaseTypeCounts,
      testCaseSeverityCounts,
      assignedRequirementCountsArray,
    } = await countresults(issues, requirements, testCases);

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
      requirementStatus: requirementStatusCounts,
      assignedIssueCounts: assignedIssueCountsArray,
      totalTestCases: testCases.length,
      testCaseType: testCaseTypeCounts,
      testCaseSeverity: testCaseSeverityCounts,
      assignedRequirementCounts: assignedRequirementCountsArray,
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
    if (task.status) {
      taskCounts[task.status]++;
    }
  });

  return taskCounts;
}

async function countresults(
  issue: any[],
  requirements: IRequirement[],
  testCases: ITestCase[]
) {
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

  const requirementStatusCounts: any = {};
  requirementStatusCounts[TaskStatus.TODO] = 0;
  requirementStatusCounts[TaskStatus.IN_PROGRESS] = 0;
  requirementStatusCounts[TaskStatus.BLOCKED] = 0;
  requirementStatusCounts[TaskStatus.DONE] = 0;

  const testCaseTypeCounts: any = {};
  testCaseTypeCounts[TEST_TYPE.AUTOMATION] = 0;
  testCaseTypeCounts[TEST_TYPE.MANUAL] = 0;

  const testCaseSeverityCounts: any = {};
  testCaseSeverityCounts[TEST_CASE_SEVERITY.LOW] = 0;
  testCaseSeverityCounts[TEST_CASE_SEVERITY.MEDIUM] = 0;
  testCaseSeverityCounts[TEST_CASE_SEVERITY.HIGH] = 0;

  const userIdFormat = await IdFormat.findOne({ entity: DBModels.USER });
  const assignedIssueCounts: Record<
    string,
    { noOfAssigned: number; customId: string; fullName: string; role: string }
  > = {};
  const userMap: Record<string, any> = {};

  // Assign in requirements
  const assignedRequirementCounts: Record<
    string,
    { noOfAssigned: number; customId: string; fullName: string; role: string }
  > = {};
  const requirementUserMap: Record<string, any> = {};

  for (const result of issue) {
    // Assigned count
    let assignedTo = "Unassigned";
    let userDetails = { customId: "", fullName: "", role: "" };

    if (result.assignedTo) {
      if (!userMap[result.assignedTo.toString()]) {
        const user = await User.findById(result.assignedTo).select(
          "_id customId firstName lastName role"
        );
        if (user) {
          const customId = replaceCustomId(
            userIdFormat.idFormat,
            user.customId
          );
          // console.log("customId", customId);
          userDetails = {
            customId,
            fullName: `${user.firstName || ""} ${user.lastName || ""}`,
            role: user.role,
          };
          userMap[result.assignedTo.toString()] = userDetails;
        }
      }

      userDetails = userMap[result.assignedTo.toString()];
      if (userDetails) {
        assignedTo = userDetails.customId;
      } else {
        assignedTo = "Unassigned";
        userDetails = { customId: "", fullName: "", role: "" };
      }
    }
    assignedIssueCounts[assignedTo] = {
      noOfAssigned: (assignedIssueCounts[assignedTo]?.noOfAssigned || 0) + 1,
      ...userDetails,
    };

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
  }

  const assignedIssueCountsArray = Object.entries(assignedIssueCounts).map(
    ([customId, { noOfAssigned, fullName, role }]) => ({
      customId,
      noOfAssigned,
      fullName,
      role,
    })
  );

  // Assign by requirement
  for (const result of requirements) {
    let assignedTo = "Unassigned";
    let userDetails = { customId: "", fullName: "", role: "" };

    if (result.assignedTo) {
      if (!requirementUserMap[result.assignedTo.toString()]) {
        const user = await User.findById(result.assignedTo).select(
          "_id customId firstName lastName role"
        );
        if (user) {
          const customId = replaceCustomId(
            userIdFormat.idFormat,
            user.customId
          );
          userDetails = {
            customId,
            fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            role: user.role,
          };
          requirementUserMap[result.assignedTo.toString()] = userDetails;
        }
      }

      userDetails = requirementUserMap[result.assignedTo.toString()];
      if (userDetails) {
        assignedTo = userDetails.customId;
      } else {
        assignedTo = "Unassigned";
        userDetails = { customId: "", fullName: "", role: "" };
      }
    }

    assignedRequirementCounts[assignedTo] = {
      noOfAssigned:
        (assignedRequirementCounts[assignedTo]?.noOfAssigned || 0) + 1,
      ...userDetails,
    };

    // By status
    if (result.status) {
      requirementStatusCounts[result.status]++;
    }
  }

  const assignedRequirementCountsArray = Object.entries(
    assignedRequirementCounts
  ).map(([customId, { noOfAssigned, fullName, role }]) => ({
    customId,
    noOfAssigned,
    fullName,
    role,
  }));

  // Test case count
  testCases.forEach((testCase) => {
    // By type
    if (testCase.testType) {
      testCaseTypeCounts[testCase.testType]++;
    }

    // By severity
    if (testCase.severity) {
      testCaseSeverityCounts[testCase.severity]++;
    }
  });

  return {
    severityCounts,
    priorityCounts,
    statusCounts,
    issueTypeCounts,
    requirementStatusCounts,
    assignedIssueCountsArray,
    testCaseTypeCounts,
    testCaseSeverityCounts,
    assignedRequirementCountsArray,
  };
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
