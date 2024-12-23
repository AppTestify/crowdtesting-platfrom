import { DB_CONNECTION_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { IssueStatus, IssueType, Priority, Severity } from "@/app/_constants/issue";
import { connectDatabase } from "@/app/_db";
import { IIssue } from "@/app/_interface/issue";
import { IProject } from "@/app/_interface/project";
import { verifySession } from "@/app/_lib/dal";
import { Issue } from "@/app/_models/issue.model";
import { Project } from "@/app/_models/project.model";
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

        const projects = await Project.find({ "users.userId": session.user._id });
        const issues = await Issue.find({ projectId: projects.map((project) => project._id) });

        // 
        let completedCount = 0;
        let ongoingCount = 0;

        projects.forEach((project) => {
            const projectIssues = issues.filter((issue) => issue.projectId.equals(project._id));
            const isCompleted = projectIssues.every((issue) =>
                ["success", "retest_passed"].includes(issue.status)
            );

            if (isCompleted) {
                completedCount++;
            } else {
                ongoingCount++;
            }
        });

        const issueCounts = await Issue.find({ projectId: projects.map((project) => project._id) }).countDocuments();
        // const testCycleCounts = await TestCycle.find({ projectId: projects.map((project) => project._id) }).countDocuments();

        const projectCounts = countProjectResults(projects);

        const { severityCounts, statusCounts } = countresults(issues);
        return Response.json({
            severity: severityCounts, status: statusCounts,
            project: projectCounts, issue: issueCounts,
            ProjectSequence: { completed: completedCount, ongoing: ongoingCount }
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
        if (project?.isActive === true) statusCounts.active++
        else statusCounts.inActive++;
    })

    return statusCounts;
}

function countIssuesStatus(issues: IIssue[]) {
    const completedCount = issues.filter((issue) =>
        ["success", "retest_passed"].includes(issue?.status as string)
    ).length;

    const ongoingCount = issues.length - completedCount;

    return { completed: completedCount, ongoing: ongoingCount };
}

function countresults(issue: any[]) {
    const severityCounts = {
        minor: 0,
        major: 0,
        critical: 0,
    };

    const statusCounts = {
        reported: 0,
        fixed: 0,
        duplicate: 0,
        invalid: 0,
        deferred: 0,
        retest_failed: 0,
        retest_passed: 0,
    };


    issue.forEach((result) => {
        // By severity
        if (result.severity === Severity.MINOR) severityCounts.minor++;
        if (result.severity === Severity.MAJOR) severityCounts.major++;
        if (result.severity === Severity.CRITICAL) severityCounts.critical++;

        // By status
        if (result.status === IssueStatus.REPORTED) statusCounts.reported++;
        if (result.status === IssueStatus.FIXED) statusCounts.fixed++;
        if (result.status === IssueStatus.DUPLICATE) statusCounts.duplicate++;
        if (result.status === IssueStatus.INVALID) statusCounts.invalid++;
        if (result.status === IssueStatus.DEFERRED) statusCounts.deferred++;
        if (result.status === IssueStatus.RETEST_FAILED) statusCounts.retest_failed++;
        if (result.status === IssueStatus.RETEST_PASSED) statusCounts.retest_passed++;
    });

    return { severityCounts, statusCounts };
}
