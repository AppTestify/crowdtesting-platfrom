import { DB_CONNECTION_ERROR_MESSAGE, GENERIC_ERROR_MESSAGE, INVALID_INPUT_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { verifySession } from "@/app/_lib/dal";
import { RequirementAttachment } from "@/app/_models/requirement-attachment.model";
import { Requirement } from "@/app/_models/requirement.model";
import { requirementSchema } from "@/app/_schemas/requirement.schema";
import { errorHandler } from "@/app/_utils/error-handler";

export async function DELETE(
    req: Request,
    { params }: { params: { requirementId: string } }
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

        const { requirementId } = params;
        const response = await Requirement.findByIdAndDelete(requirementId);

        const issueAttachment = await RequirementAttachment.find({ requirementId: requirementId }).exec();
        const issueAttachmentCloudIds = issueAttachment.map((attachment) => attachment.cloudId);

        // delete attachments from drive
        const attachmentService = new AttachmentService();
        for (const cloudId of issueAttachmentCloudIds) {
            if (cloudId) {
                await attachmentService.deleteFileFromDrive(cloudId);
            }
        }

        if (!response) {
            throw new Error(GENERIC_ERROR_MESSAGE);
        }

        await RequirementAttachment.deleteMany({ requirementId: requirementId })

        return Response.json({ message: "Requirement deleted successfully" });
    } catch (error: any) {
        return errorHandler(error);
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { requirementId: string } }
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
        const response = requirementSchema.safeParse(body);

        if (!response.success) {
            return Response.json(
                {
                    message: INVALID_INPUT_ERROR_MESSAGE,
                    errors: response.error.errors,
                },
                { status: HttpStatusCode.BAD_REQUEST }
            );
        }

        const { requirementId } = params
        const updateResponse = await Requirement.findByIdAndUpdate(requirementId, {
            ...response.data
        });

        if (!updateResponse) {
            throw new Error(GENERIC_ERROR_MESSAGE);
        }

        return Response.json({
            message: "Requirement updated successfully"
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

        let response = null;
        const { requirementId } = params;

        response = await Requirement.findById(requirementId)
        return Response.json(response);
    } catch (error: any) {
        return errorHandler(error);
    }
}