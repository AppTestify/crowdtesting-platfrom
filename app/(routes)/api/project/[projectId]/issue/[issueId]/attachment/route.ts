import { AttachmentFolder } from "@/app/_constants/constant-server-side";
import { DB_CONNECTION_ERROR_MESSAGE, GENERIC_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { verifySession } from "@/app/_lib/dal";
import { IssueAttachment } from "@/app/_models/issue-attachment.model";
import { Issue } from "@/app/_models/issue.model";
import { getFileMetaData } from "@/app/_utils/common-server-side";
import { normaliseIds } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";

export async function POST(
    req: Request,
    { params }: { params: { issueId: string } }
) {
    try {
        const session = await verifySession();

        if (!session) {
            return Response.json(
                { message: USER_UNAUTHORIZED_ERROR_MESSAGE },
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
        const body = await req.formData();
        const attachments = body.getAll("attachments");
        const attachmentService = new AttachmentService();

        const attachmentIds =
            await Promise.all(
                attachments.map(async (file) => {
                    if (file) {
                        const { name, contentType } = await getFileMetaData(file);
                        const cloudId = await attachmentService.uploadFileInGivenFolderInDrive(file, AttachmentFolder.ISSUES);

                        const newAttachment = new IssueAttachment({
                            cloudId: cloudId,
                            name,
                            contentType,
                            issueId: issueId,
                        });

                        const savedAttachment = await newAttachment.save();
                        return savedAttachment._id;
                    }
                })
            );

        await Issue.findByIdAndUpdate(
            issueId,
            { $push: { attachments: { $each: attachmentIds } } },
            { new: true }
        );

        return Response.json({
            "message": "Issue attachment added successfully"
        })

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

        if (!session) {
            return Response.json(
                { message: USER_UNAUTHORIZED_ERROR_MESSAGE },
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
        const response = normaliseIds(
            await IssueAttachment.find({ issueId: issueId })
                .sort({ createdAt: -1 })
                .lean()
        );
        if (!response) {
            throw new Error(GENERIC_ERROR_MESSAGE);
        }

        return Response.json(response);

    } catch (error: any) {
        return errorHandler(error);
    }
}