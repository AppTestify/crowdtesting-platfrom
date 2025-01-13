import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { verifySession } from "@/app/_lib/dal";
import { ReportAttachment } from "@/app/_models/report-attachment.model";
import { Report } from "@/app/_models/report.model";
import { ReportSchema } from "@/app/_schemas/report.schema";
import { errorHandler } from "@/app/_utils/error-handler";

export async function DELETE(
  req: Request,
  { params }: { params: { reportId: string } }
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

    const { reportId } = params;
    const response = await Report.findByIdAndDelete(reportId);

    if (!response) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    const reportAttachment = await ReportAttachment.find({
      reportId: reportId,
    }).exec();
    const reportAttachmentCloudIds = reportAttachment.map(
      (attachment) => attachment.cloudId
    );

    // delete attachments from drive
    const attachmentService = new AttachmentService();
    for (const cloudId of reportAttachmentCloudIds) {
      if (cloudId) {
        await attachmentService.deleteFileFromDrive(cloudId);
      }
    }

    await ReportAttachment.deleteMany({ reportId: reportId });

    return Response.json({ message: "Report deleted successfully" });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { reportId: string; projectId: string } }
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
    const response = ReportSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const { reportId } = params;
    const updateResponse = await Report.findByIdAndUpdate(reportId, {
      ...response.data,
    });

    if (!updateResponse) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    return Response.json({
      message: "Report updated successfully",
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}
