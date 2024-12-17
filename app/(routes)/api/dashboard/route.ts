import { monthNames } from "@/app/_constants/constant-server-side";
import { DB_CONNECTION_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, isClient, verifySession } from "@/app/_lib/dal";
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

        let response;
        const today = new Date();
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

        if (await isAdmin(session.user)) {

            const projectCounts = await Project.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sixMonthsAgo },
                    },
                },
                {
                    $addFields: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" },
                    },
                },
                {
                    $group: {
                        _id: { month: "$month", year: "$year" },
                        projectCount: { $sum: 1 },
                    },
                },
                {
                    $sort: { "_id.year": 1, "_id.month": 1 },
                },
            ]);

            const issueCounts = await Issue.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sixMonthsAgo },
                    },
                },
                {
                    $addFields: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" },
                    },
                },
                {
                    $group: {
                        _id: { month: "$month", year: "$year" },
                        issueCount: { $sum: 1 },
                    },
                },
                {
                    $sort: { "_id.year": 1, "_id.month": 1 },
                },
            ]);

            response = projectCounts.map(project => {
                const issue = issueCounts.find(
                    i => i._id.month === project._id.month && i._id.year === project._id.year
                );

                return {
                    month: monthNames[project._id.month - 1],
                    year: project._id.year,
                    Project: project.projectCount,
                    Issue: issue ? issue.issueCount : 0,
                };
            });

        } else {
            const projectCounts = await Project.aggregate([
                {
                    $match: {
                        // userId: session.user._id,
                        createdAt: { $gte: sixMonthsAgo },
                    },
                },
                {
                    $addFields: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" },
                    },
                },
                {
                    $group: {
                        _id: { month: "$month", year: "$year" },
                        projectCount: { $sum: 1 },
                    },
                },
                {
                    $sort: { "_id.year": 1, "_id.month": 1 },
                },
            ]);

            const issueCounts = await Issue.aggregate([
                {
                    $match: {
                        // userId: session.user._id,
                        createdAt: { $gte: sixMonthsAgo },
                    },
                },
                {
                    $addFields: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" },
                    },
                },
                {
                    $group: {
                        _id: { month: "$month", year: "$year" },
                        issueCount: { $sum: 1 },
                    },
                },
                {
                    $sort: { "_id.year": 1, "_id.month": 1 },
                },
            ]);

            response = projectCounts.map(project => {
                const issue = issueCounts.find(
                    i => i._id.month === project._id.month && i._id.year === project._id.year
                );

                return {
                    month: monthNames[project._id.month - 1],
                    year: project._id.year,
                    Project: project.projectCount,
                    Issue: issue ? issue.issueCount : 0,
                };
            });
        }

        return Response.json(response);
    } catch (error: any) {
        return errorHandler(error);
    }
}