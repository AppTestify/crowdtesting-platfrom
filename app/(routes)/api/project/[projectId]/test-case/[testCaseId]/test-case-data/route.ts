import { AttachmentFolder } from "@/app/_constants/constant-server-side";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { ITestCaseData } from "@/app/_interface/test-case-data";
import { verifySession } from "@/app/_lib/dal";
import { TestCaseData } from "@/app/_models/test-case-data";
import { TestCaseDataAttachment } from "@/app/_models/test-case-data-attachment.model";
import { testCaseDataSchema } from "@/app/_schemas/test-case-data.schema";
import { getFileMetaData } from "@/app/_utils/common-server-side";
import { errorHandler } from "@/app/_utils/error-handler";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string; testCaseId: string } }
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

    const body = await req.formData();
    const testCases = [];
    let index = 0;

    // Group testCases with attachments
    while (body.has(`testCases[${index}][name]`)) {
      const attachments = body.getAll(`testCases[${index}][attachments]`);
      testCases.push({
        name: (body.get(`testCases[${index}][name]`) as string) || "",
        type: (body.get(`testCases[${index}][type]`) as string) || "",
        validation:
          (body.getAll(
            `testCases[${index}][validation][]`
          ) as unknown as string[]) || [],
        inputValue:
          (body.get(`testCases[${index}][inputValue]`) as string) || "",
        description:
          (body.get(`testCases[${index}][description]`) as string) || "",
        attachments: attachments.length > 0 ? attachments : [],
      });
      index++;
    }

    const formData = {
      testCaseId: body.get("testCaseId"),
      testCases: testCases,
    };

    const response = testCaseDataSchema.safeParse(formData);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }
    const { testCaseId } = params;
    // const attachments = body.getAll("attachments");

    const attachmentService = new AttachmentService();
    const uploadAttachments = async (
      attachments: any[],
      testCaseDataId: string
    ) => {
      const attachmentIds = await Promise.all(
        attachments.map(async (file: any) => {
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
          return null;
        })
      );
      return attachmentIds.filter((id) => id !== null);
    };

    const testCaseData = response.data?.testCases?.map((testCase, index) => ({
      ...testCase,
      userId: session.user._id,
      testCaseId: testCaseId,
      attachments: [],
    }));

    const savedTestCaseData = await TestCaseData.insertMany(testCaseData);

    for (let index = 0; index < savedTestCaseData.length; index++) {
      const data = savedTestCaseData[index];
      const currentAttachments = response?.data?.testCases[index]?.attachments;

      if (currentAttachments && currentAttachments.length > 0) {
        const validAttachmentIds = await uploadAttachments(
          currentAttachments,
          data._id
        );

        if (validAttachmentIds.length > 0) {
          await TestCaseData.findByIdAndUpdate(
            data._id,
            { $push: { attachments: { $each: validAttachmentIds } } },
            { new: true }
          );
        }
      }
    }

    return Response.json({
      message: "Test case data added successfully",
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function GET(
  req: Request,
  { params }: { params: { projectId: string; testCaseId: string } }
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

    const { testCaseId } = params;
    const response = await TestCaseData.find({ testCaseId: testCaseId });

    return Response.json(response);
  } catch (error: any) {
    return errorHandler(error);
  }
}
