import { AttachmentFolder } from "@/app/_constants/constant-server-side";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { verifySession } from "@/app/_lib/dal";
import { TestCaseData } from "@/app/_models/test-case-data";
import { TestCaseDataAttachment } from "@/app/_models/test-case-data-attachment.model";
import {
  getAllAttachments,
  getFileMetaData,
} from "@/app/_utils/common-server-side";
import { errorHandler } from "@/app/_utils/error-handler";

export async function GET(
  req: Request,
  { params }: { params: { testCaseDataId: string } }
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

    const { testCaseDataId } = params;
    const testCaseAttachments = await TestCaseDataAttachment.find({
      testCaseDataId: testCaseDataId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const attachments = testCaseAttachments.map((item) => ({
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

export async function POST(
  req: Request,
  { params }: { params: { testCaseDataId: string } }
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

    const { testCaseDataId } = params;
    const body = await req.formData();
    const attachments = body.getAll("attachments");
    const attachmentService = new AttachmentService();

    const attachmentIds = await Promise.all(
      attachments.map(async (file) => {
        if (file) {
          const { name, contentType } = await getFileMetaData(file);
          const cloudId =
            await attachmentService.uploadFileInGivenFolderInDrive(
              file,
              AttachmentFolder.TEST_CASE_DATA
            );

          const newAttachment = new TestCaseDataAttachment({
            cloudId: cloudId,
            name,
            contentType,
            testCaseDataId: testCaseDataId,
          });

          const savedAttachment = await newAttachment.save();
          return savedAttachment._id;
        }
      })
    );

    await TestCaseData.findByIdAndUpdate(
      testCaseDataId,
      { $push: { attachments: { $each: attachmentIds } } },
      { new: true }
    );

    return Response.json({
      message: "Test case data attachment added successfully",
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}
