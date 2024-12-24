import { DB_CONNECTION_ERROR_MESSAGE, GENERIC_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { verifySession } from "@/app/_lib/dal";
import { IssueAttachment } from "@/app/_models/issue-attachment.model";
import { errorHandler } from "@/app/_utils/error-handler";


export async function DELETE(
    req: Request,
    { params }: { params: { attachmentId: string } }
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

        const { attachmentId } = params;
        const response = await IssueAttachment.findOneAndDelete({ cloudId: attachmentId });
        const attachmentService = new AttachmentService();
        await attachmentService.deleteFileFromDrive(attachmentId);

        if (!response) {
            throw new Error(GENERIC_ERROR_MESSAGE);
        }

        return Response.json({
            "message": "Issue attachment deleted successfully"
        });
    } catch (error: any) {
        return errorHandler(error);
    }
}