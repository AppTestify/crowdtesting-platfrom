import { DB_CONNECTION_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { IssueStatus, IssueType, Priority, Severity } from "@/app/_constants/issue";
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

        const projects = await Project.find({ userId: session.user._id });
        // const projectByStatus = projects.countDocuments({
        //     userId: session.user._id,
        //     status: 'active' 
        // });
        const issues = await Issue.find({ projectId: projects.map((project) => project._id) });

        const { severityCounts, priorityCounts, statusCounts, issueTypeCounts } = countresults(issues);
        return Response.json({
            "severity": severityCounts, "priority": priorityCounts, "status": statusCounts,
            "issueType": issueTypeCounts,
        });
    } catch (error: any) {
        return errorHandler(error);
    }
}

function countresults(issue: any[]) {
    const severityCounts = {
        minor: 0,
        major: 0,
        critical: 0,
    };

    const priorityCounts = {
        low: 0,
        normal: 0,
        high: 0,
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

    const issueTypeCounts = {
        functional: 0,
        ui_ux: 0,
        usability: 0,
        performance: 0,
        security: 0,
        total: 0
    };

    issue.forEach((result) => {
        // By severity
        if (result.severity === Severity.MINOR) severityCounts.minor++;
        if (result.severity === Severity.MAJOR) severityCounts.major++;
        if (result.severity === Severity.CRITICAL) severityCounts.critical++;

        // By priority
        if (result.priority === Priority.LOW) priorityCounts.low++;
        if (result.priority === Priority.NORMAL) priorityCounts.normal++;
        if (result.priority === Priority.HIGH) priorityCounts.high++;

        // By status
        if (result.status === IssueStatus.REPORTED) statusCounts.reported++;
        if (result.status === IssueStatus.FIXED) statusCounts.fixed++;
        if (result.status === IssueStatus.DUPLICATE) statusCounts.duplicate++;
        if (result.status === IssueStatus.INVALID) statusCounts.invalid++;
        if (result.status === IssueStatus.DEFERRED) statusCounts.deferred++;
        if (result.status === IssueStatus.RETEST_FAILED) statusCounts.retest_failed++;
        if (result.status === IssueStatus.RETEST_PASSED) statusCounts.retest_passed++;

        // By issue type
        if (result.issueType === IssueType.FUNCTIONAL) issueTypeCounts.functional++;
        if (result.issueType === IssueType.UI_UX) issueTypeCounts.ui_ux++;
        if (result.issueType === IssueType.USABILITY) issueTypeCounts.usability++;
        if (result.issueType === IssueType.PERFORMANCE) issueTypeCounts.performance++;
        if (result.issueType === IssueType.SECURITY) issueTypeCounts.security++;
        issueTypeCounts.total = Object.entries(issueTypeCounts)
            .filter(([key]) => key !== "total")
            .reduce((total, [, count]) => total + count, 0);
    });

    return { severityCounts, priorityCounts, statusCounts, issueTypeCounts };
}
