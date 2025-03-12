import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { TestCaseResultAttachment } from "@/app/_models/test-case-result-attachment.model";
import { getAllAttachments } from "@/app/_utils/common-server-side";
import { errorHandler } from "@/app/_utils/error-handler";

export async function GET(
  req: Request,
  { params }: { params: { testCaseExecutionId: string } }
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

    const { testCaseExecutionId } = params;
    const testCaseResultAttachments = await TestCaseResultAttachment.find({
      testCaseResultId: testCaseExecutionId,
    })
      .sort({ createdAt: -1 })
      .lean();
    const attachments = testCaseResultAttachments.map((item) => ({
      cloudId: item.cloudId,
      name: item.name,
      contentType: item.contentType,
      ...item,
    }));

    const response = await getAllAttachments({ attachments });

    if (!response) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    return Response.json(response);
  } catch (error: any) {
    return errorHandler(error);
  }
}
