import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { TestCase } from "@/app/_constants/test-case";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { TestCaseData } from "@/app/_models/test-case-data";
import { TestCaseDataAttachment } from "@/app/_models/test-case-data-attachment.model";
import { getAllAttachments } from "@/app/_utils/common-server-side";
import { errorHandler } from "@/app/_utils/error-handler";

export async function GET(
  req: Request,
  { params }: { params: { testCaseId: string } }
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

    const { testCaseId } = params;

    // 1. Fetch TestCaseData
    const testCaseData = await TestCaseData.find({
      testCaseId: testCaseId,
    }).lean();

    // 2. Get array of _ids
    const testCaseIds = testCaseData?.map((testCase) => testCase._id);

    // 3. Fetch attachments for those TestCaseData entries
    const testCaseAttachments = await TestCaseDataAttachment.find({
      testCaseDataId: testCaseIds,
    })
      .sort({ createdAt: -1 })
      .lean();

    // 4. Transform attachments to include testCaseDataId and other relevant fields
    const attachments = testCaseAttachments.map((item) => ({
      cloudId: item.cloudId,
      name: item.name,
      contentType: item.contentType,
      testCaseDataId: item.testCaseDataId?.toString(),
      ...item,
    }));

    const cloudData = await getAllAttachments({ attachments });

    if (!cloudData) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    const attachmentsGrouped: Record<string, any[]> = {};
    cloudData.forEach((item) => {
      const id = item.attachment.testCaseDataId?.toString();
      if (!attachmentsGrouped[id]) attachmentsGrouped[id] = [];
      attachmentsGrouped[id].push(item);
    });

    const response = {
      testCaseData: testCaseData.map((testCase) => ({
        ...testCase,
        attachments: attachmentsGrouped[String(testCase._id)] || [],
      })),
    };

    return Response.json(response);
  } catch (error: any) {
    return errorHandler(error);
  }
}
