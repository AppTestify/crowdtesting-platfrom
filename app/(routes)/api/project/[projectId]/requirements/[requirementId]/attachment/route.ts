import { AttachmentFolder } from "@/app/_constants/constant-server-side";
import { DB_CONNECTION_ERROR_MESSAGE, GENERIC_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { verifySession } from "@/app/_lib/dal";
import { RequirementAttachment } from "@/app/_models/requirement-attachment.model";
import { Requirement } from "@/app/_models/requirement.model";
import { getFileMetaData } from "@/app/_utils/common-server-side";
import { normaliseIds } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";

export async function POST(
    req: Request,
    { params }: { params: { requirementId: string } }
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

        const { requirementId } = params;
        const body = await req.formData();
        const attachments = body.getAll("attachments");
        const attachmentService = new AttachmentService();

        const attachmentIds =
            await Promise.all(
                attachments.map(async (file) => {
                    if (file) {
                        const { name, contentType } = await getFileMetaData(file);
                        const cloudId = await attachmentService.uploadFileInGivenFolderInDrive(file, AttachmentFolder.REQUIREMENTS);
                        const newAttachment = new RequirementAttachment({
                            cloudId: cloudId,
                            name,
                            contentType,
                            requirementId: requirementId,
                        });

                        const savedAttachment = await newAttachment.save();
                        return savedAttachment._id;
                    }
                })
            );

        await Requirement.findByIdAndUpdate(
            requirementId,
            { $push: { attachments: { $each: attachmentIds } } },
            { new: true }
        );

        return Response.json({
            "message": "Requirement attachment added successfully"
        })

    } catch (error: any) {
        return errorHandler(error);
    }
}

export async function GET(
    req: Request,
    { params }: { params: { requirementId: string } }
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

        const { requirementId } = params;
        const response = normaliseIds(
            await RequirementAttachment.find({ requirementId: requirementId })
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