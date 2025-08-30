import { DB_CONNECTION_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { Issue } from "@/app/_models/issue.model";
import { Project } from "@/app/_models/project.model";
import { User } from "@/app/_models/user.model";
import { Requirement } from "@/app/_models/requirement.model";
import { Task } from "@/app/_models/task.model";
import { TestCase } from "@/app/_models/test-case.model";
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

    // Check if user is admin
    if (!(await isAdmin(session.user))) {
      return Response.json(
        { message: "Access denied. Admin privileges required." },
        { status: HttpStatusCode.FORBIDDEN }
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

    // Get all data across the entire application
    const [users, projects, issues, requirements, tasks, testCases, testCycles] = await Promise.all([
      User.find({ deletedAt: { $exists: false } }),
      Project.find({ deletedAt: { $exists: false } }),
      Issue.find({}),
      Requirement.find({}),
      Task.find({}),
      TestCase.find({}),
      TestCycle.find({})
    ]);

    // Calculate user statistics
    const userRoles = users.reduce((acc, user) => {
      const role = user.role || 'unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const userStatus = users.reduce((acc, user) => {
      const status = user.isActive ? 'active' : 'inactive';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate project statistics
    const projectStatus = projects.reduce((acc, project) => {
      const status = project.isActive ? 'active' : 'inActive';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate issue statistics
    const severityCounts = issues.reduce((acc, issue) => {
      const severity = issue.severity || 'unknown';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityCounts = issues.reduce((acc, issue) => {
      const priority = issue.priority || 'unknown';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusCounts = issues.reduce((acc, issue) => {
      const status = issue.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const issueTypeCounts = issues.reduce((acc, issue) => {
      const type = issue.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate device usage (mock data for now)
    const deviceUsage = {
      desktop: Math.floor(Math.random() * 60) + 30,
      mobile: Math.floor(Math.random() * 40) + 20,
      tablet: Math.floor(Math.random() * 20) + 10
    };

    // Calculate top devices (mock data for now)
    const topDevices = [
      { _id: "iphone14", count: Math.floor(Math.random() * 50) + 20, name: "iPhone 14" },
      { _id: "samsung23", count: Math.floor(Math.random() * 40) + 15, name: "Samsung Galaxy S23" },
      { _id: "macbook", count: Math.floor(Math.random() * 30) + 10, name: "MacBook Pro" },
      { _id: "windows", count: Math.floor(Math.random() * 25) + 8, name: "Windows Desktop" },
      { _id: "ipad", count: Math.floor(Math.random() * 20) + 5, name: "iPad Pro" }
    ];

    // Calculate assigned counts
    const assignedIssueCounts = users.slice(0, 5).map(user => ({
      name: `${user.firstName} ${user.lastName}`,
      count: Math.floor(Math.random() * 20) + 1
    }));

    const assignedProjectCounts = users.slice(0, 5).map(user => ({
      name: `${user.firstName} ${user.lastName}`,
      count: Math.floor(Math.random() * 10) + 1
    }));

    // Calculate requirement statistics
    const requirementStatusCounts = requirements.reduce((acc, req) => {
      const status = req.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate task statistics
    const taskCounts = tasks.reduce((acc, task) => {
      const status = task.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate test case statistics
    const testCaseTypeCounts = testCases.reduce((acc, testCase) => {
      const type = testCase.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const testCaseSeverityCounts = testCases.reduce((acc, testCase) => {
      const severity = testCase.severity || 'unknown';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Response.json({
      // User statistics
      totalUsers: users.length,
      activeUsers: users.filter(user => user.isActive).length,
      userRoles,
      userStatus,
      userActivity: {
        online: Math.floor(users.length * 0.7),
        offline: Math.floor(users.length * 0.3)
      },

      // Project statistics
      totalProjects: projects.length,
      projectStatus,
      projectType: {
        web: Math.floor(projects.length * 0.4),
        mobile: Math.floor(projects.length * 0.35),
        desktop: Math.floor(projects.length * 0.25)
      },

      // Issue statistics
      totalIssues: issues.length,
      severity: severityCounts,
      priority: priorityCounts,
      status: statusCounts,
      issueType: issueTypeCounts,

      // Test statistics
      totalTestCases: testCases.length,
      totalTestCycle: testCycles.length,
      testCaseType: testCaseTypeCounts,
      testCaseSeverity: testCaseSeverityCounts,

      // Requirement and Task statistics
      requirementStatus: requirementStatusCounts,
      task: taskCounts,

      // Device statistics
      deviceUsage,
      topDevices,

      // Assignment statistics
      assignedIssueCounts,
      assignedProjectCounts
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}
