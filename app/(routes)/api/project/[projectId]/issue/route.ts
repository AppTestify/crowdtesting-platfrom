import { DBModels } from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { IssueAttachment } from "@/app/_models/issue-attachment.model";
import { Issue } from "@/app/_models/issue.model";
import { issueSchema } from "@/app/_schemas/issue.schema";
import { getFileMetaData, serverSidePagination } from "@/app/_utils/common-server-side";
import { addCustomIds, normaliseIds } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
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
    const attachments = body.getAll("attachments");
    const formData = {
      title: body.get("title"),
      severity: body.get("severity"),
      priority: body.get("priority"),
      description: body.get("description"),
      projectId: body.get("projectId"),
      status: body.get("status"),
      device: body.getAll("device[]"),
      issueType: body.get("issueType"),
      testCycle: body.get("testCycle")
    };
    const response = issueSchema.safeParse(formData);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const newIssue = new Issue({
      ...response.data,
      userId: session.user._id,
    });

    const savedIssue = await newIssue.save();

    const attachmentIds =
      await Promise.all(
        attachments.map(async (file) => {
          if (file) {
            const { data, name, contentType } = await getFileMetaData(file);
            const newAttachment = new IssueAttachment({
              data: data,
              name,
              contentType,
              issueId: savedIssue._id,
            });

            const savedAttachment = await newAttachment.save();
            return savedAttachment._id;
          }
          return null;
        })
      );

    const validAttachmentIds = attachmentIds.filter((id) => id !== null);

    await Issue.findByIdAndUpdate(
      savedIssue._id,
      { $push: { attachments: { $each: validAttachmentIds } } },
      { new: true }
    );

    return Response.json({
      message: "Issue added successfully",
      id: savedIssue?._id,
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
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

    const { projectId } = params;
    const userIdFormat = await IdFormat.findOne({ entity: DBModels.ISSUE });
    const { skip, limit } = serverSidePagination(req);
    const totalIssues = await Issue.find({
      projectId: projectId
    }).countDocuments();

    if (!(await isAdmin(session.user))) {
      response = addCustomIds(
        await Issue.find({ projectId: projectId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .populate("device testCycle")
          .lean(),
        userIdFormat.idFormat
      );
    } else {
      response = addCustomIds(
        await Issue.find({ projectId: projectId })
          .populate("userId testCycle")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .populate("device")
          .lean(),
        userIdFormat.idFormat
      );
    }

    return Response.json({ "issues": response, "total": totalIssues });
  } catch (error: any) {
    return errorHandler(error);
  }
}
