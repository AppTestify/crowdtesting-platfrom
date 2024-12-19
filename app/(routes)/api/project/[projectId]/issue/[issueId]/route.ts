import { DBModels } from "@/app/_constants";
import { DB_CONNECTION_ERROR_MESSAGE, GENERIC_ERROR_MESSAGE, INVALID_INPUT_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { IIssue } from "@/app/_interface/issue";
import { verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { IssueAttachment } from "@/app/_models/issue-attachment.model";
import { Issue } from "@/app/_models/issue.model";
import { issueSchema } from "@/app/_schemas/issue.schema";
import { addCustomIds, normaliseIds, replaceCustomId } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";

export async function PUT(
    req: Request,
    { params }: { params: { issueId: string } }
) {
    try {
        const session = await verifySession();
        if (!session) {
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

        const body = await req.json();
        const response = issueSchema.safeParse(body);

        if (!response.success) {
            return Response.json(
                {
                    message: INVALID_INPUT_ERROR_MESSAGE,
                    errors: response.error.errors,
                },
                { status: HttpStatusCode.BAD_REQUEST }
            );
        }

        const { issueId } = params
        const updateResponse = await Issue.findByIdAndUpdate(issueId, {
            ...response.data
        }, { new: true });

        if (!updateResponse) {
            throw new Error(GENERIC_ERROR_MESSAGE);
        }

        return Response.json({
            message: "Issue updated successfully"
        })
    } catch (error: any) {
        return errorHandler(error);
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { issueId: string } }
) {
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

        const { issueId } = params;
        const response = await Issue.findByIdAndDelete(issueId);

        if (!response) {
            throw new Error(GENERIC_ERROR_MESSAGE);
        }
        await IssueAttachment.deleteMany({ issueId: issueId })

        return Response.json({ message: "Issue deleted successfully" });
    } catch (error: any) {
        return errorHandler(error);
    }
}

export async function GET(
    req: Request,
    { params }: { params: { issueId: string } }
) {
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

        const { issueId } = params;
        const userIdFormat = await IdFormat.findOne({ entity: DBModels.ISSUE });
        const issue = await Issue.findById(issueId).populate("device", "_id name").lean() as IIssue | null;

        const response = {
            ...issue,
            customId: issue?.customId
                ? replaceCustomId(userIdFormat.idFormat, issue?.customId)
                : null
        }

        return Response.json(response);
    } catch (error: any) {
        return errorHandler(error);
    }
}
