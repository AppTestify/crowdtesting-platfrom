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
import { TestCycleAttachment } from "@/app/_models/test-cycle-attachment.model";
import { TestCycle } from "@/app/_models/test-cycle.model";
import {
  getAllAttachments,
  getFileMetaData,
} from "@/app/_utils/common-server-side";
import { errorHandler } from "@/app/_utils/error-handler";

export async function POST(
  req: Request,
  { params }: { params: { testCycleId: string } }
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

    const { testCycleId } = params;
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
              AttachmentFolder.TEST_CYCLE
            );

          const newAttachment = new TestCycleAttachment({
            cloudId: cloudId,
            name,
            contentType,
            testCycleId: testCycleId,
          });

          const savedAttachment = await newAttachment.save();
          return savedAttachment._id;
        }
      })
    );

    await TestCycle.findByIdAndUpdate(
      testCycleId,
      { $push: { attachments: { $each: attachmentIds } } },
      { new: true }
    );

    return Response.json({
      message: "Test cycle attachment added successfully",
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function GET(
  req: Request,
  { params }: { params: { testCycleId: string } }
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

    const { testCycleId } = params;
    const testCycleAttachments = await TestCycleAttachment.find({
      testCycleId: testCycleId,
    })
      .sort({ createdAt: -1 })
      .lean();
    const attachments = testCycleAttachments.map((item) => ({
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
