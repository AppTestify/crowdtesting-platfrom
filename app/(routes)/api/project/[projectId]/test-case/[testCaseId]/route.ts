import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { verifySession } from "@/app/_lib/dal";
import { TestCaseAttachment } from "@/app/_models/test-case-attachment.model";
import { TestCaseData } from "@/app/_models/test-case-data";
import { TestCaseStep } from "@/app/_models/test-case-step.model";
import { TestCase } from "@/app/_models/test-case.model";
import { testCaseStepSchema } from "@/app/_schemas/test-case-step.schema";
import { testCaseSchema } from "@/app/_schemas/test-case.schema";
import { errorHandler } from "@/app/_utils/error-handler";

export async function DELETE(
  req: Request,
  { params }: { params: { testCaseId: string } }
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
    const response = await TestCase.findByIdAndDelete(testCaseId);
    await TestCaseStep.deleteMany({ testCaseId });
    await TestCaseData.deleteMany({ testCaseId });

    // Delete its all attachment
    const testCaseAttachment = await TestCaseAttachment.find({
      testCaseId: testCaseId,
    }).exec();
    const issueAttachmentCloudIds = testCaseAttachment.map(
      (attachment) => attachment.cloudId
    );

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

    return Response.json({ message: "Test case deleted successfully" });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { testCaseId: string } }
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
    const response = testCaseSchema.safeParse(body);

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
    const updateResponse = await TestCase.findByIdAndUpdate(testCaseId, {
      ...response.data,
    });

    if (!updateResponse) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    return Response.json({
      message: "Test case updated successfully",
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}

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

    const body = await req.json();
    const response = testCaseStepSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }
    const { projectId, testCaseId } = params;
    const lastStep = await TestCaseStep.findOne({ testCaseId }).sort({
      order: -1,
    });
    const newOrder = lastStep ? lastStep.order + 1 : 0;
    const newTestCaseStep = new TestCaseStep({
      ...response.data,
      userId: session.user._id,
      projectId: projectId,
      testCaseId: testCaseId,
      order: newOrder,
    });
    const saveTestCaseStep = await newTestCaseStep.save();

    return Response.json({
      message: "Test case step added successfully",
      id: saveTestCaseStep?._id,
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
    const response = await TestCaseStep.find({ testCaseId: testCaseId }).sort({
      order: 1,
    });

    return Response.json(response);
  } catch (error: any) {
    return errorHandler(error);
  }
}
