import { DBModels } from "@/app/_constants";
import { AttachmentFolder } from "@/app/_constants/constant-server-side";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { IssueStatus } from "@/app/_constants/issue";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { isAdmin, isClient, verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { IssueAttachment } from "@/app/_models/issue-attachment.model";
import { Issue } from "@/app/_models/issue.model";
import { User } from "@/app/_models/user.model";
import {
  filterIssuesForAdmin,
  filterIssuesForClient,
  filterIssuesForTester,
} from "@/app/_queries/search-issues";
import { issueSchema } from "@/app/_schemas/issue.schema";
import {
  getFileMetaData,
  serverSidePagination,
} from "@/app/_utils/common-server-side";
import { addCustomIds, normaliseIds } from "@/app/_utils/data-formatters";
import { issueAssignMail } from "@/app/_utils/email";
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
      testCycle: body.get("testCycle"),
      assignedTo: body.get("assignedTo") || null,
    };
    const response = issueSchema.safeParse(formData);

    if (!attachments) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

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
      status: IssueStatus.NEW,
    });

    const savedIssue = await newIssue.save();

    if (response.data.assignedTo) {
      const assignUser = await User.findById(response.data.assignedTo).select(
        "email firstName lastName"
      );
      const payload = {
        subject: `Issue assigned to You - ${response.data.title} - [${response?.data?.status}]`,
        name: response.data.title,
        status: response.data.status || "",
        email: assignUser?.email,
        fullName: `${assignUser?.firstName} ${assignUser?.lastName}` || "",
        description: response.data.description,
        assignedBy: `${session.user.firstName} ${session.user.lastName}` || "",
        priority: response.data.priority,
      };
      await issueAssignMail(payload);
    }

    const attachmentService = new AttachmentService();
    const attachmentIds = await Promise.all(
      attachments.map(async (file) => {
        if (file) {
          const { name, contentType } = await getFileMetaData(file);
          const cloudId =
            await attachmentService.uploadFileInGivenFolderInDrive(
              file,
              AttachmentFolder.ISSUES
            );
          const newAttachment = new IssueAttachment({
            cloudId: cloudId,
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
  { params }: { params: { projectId: string; issueId: string } }
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

    let response;
    const { projectId } = params;

    let filter: any = { projectId: projectId };
    const url = new URL(req.url);
    const searchString = url.searchParams.get("searchString");
    const severity = url.searchParams.get("severity");
    const priority = url.searchParams.get("priority");
    const status = url.searchParams.get("status");
    const testCycle = url.searchParams.get("testCycle");
    const customIDFormat = await IdFormat.findOne({ entity: DBModels.ISSUE });
    const { skip, limit } = serverSidePagination(req);

    if (severity) {
      filter.severity = severity;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (status) {
      filter.status = status;
    }

    if (testCycle) {
      filter.testCycle = testCycle;
    }

    if (searchString) {
      if (await isAdmin(session.user)) {
        const { issues, totalIssues } = await filterIssuesForAdmin(
          searchString,
          skip,
          limit,
          projectId,
          customIDFormat,
          severity || undefined,
          priority || undefined,
          status || undefined,
          testCycle || undefined
        );
        return Response.json({
          issues: addCustomIds(issues, customIDFormat?.idFormat),
          total: totalIssues,
        });
      } else if (await isClient(session.user)) {
        const { issues, totalIssues } = await filterIssuesForClient(
          searchString,
          skip,
          limit,
          projectId,
          customIDFormat,
          severity || undefined,
          priority || undefined,
          status || undefined,
          testCycle || undefined
        );
        return Response.json({
          issues: addCustomIds(issues, customIDFormat?.idFormat),
          total: totalIssues,
        });
      } else {
        const { issues, totalIssues } = await filterIssuesForTester(
          searchString,
          skip,
          limit,
          projectId,
          customIDFormat,
          severity || undefined,
          priority || undefined,
          status || undefined,
          testCycle || undefined
        );
        return Response.json({
          issues: addCustomIds(issues, customIDFormat?.idFormat),
          total: totalIssues,
        });
      }
    }

    let totalIssues;
    let query = Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    if (await isAdmin(session.user)) {
      totalIssues = await Issue.find(filter).countDocuments();

      response = addCustomIds(
        await query
          .populate("userId", "firstName lastName")
          .populate("projectId", "title")
          .populate({
            path: "assignedTo",
            select: "firstName lastName",
            strictPopulate: false,
          })
          .populate({
            path: "testCycle",
            select: "title",
            strictPopulate: false,
          })
          .populate("device", "name")
          .lean(),
        customIDFormat.idFormat
      );
    } else if (await isClient(session.user)) {
      totalIssues = await Issue.find({
        status: { $nin: [IssueStatus.NEW] },
      })
        .find(filter)
        .countDocuments();

      response = addCustomIds(
        await Issue.find({ status: { $nin: IssueStatus.NEW } })
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .populate({
            path: "userId",
            select: "firstName lastName _id",
          })
          .populate({
            path: "assignedTo",
            select: "firstName lastName _id",
            strictPopulate: false,
          })
          .populate("projectId", "title")
          .populate("device", "name")
          .populate({
            path: "testCycle",
            select: "title",
            strictPopulate: false,
          })
          .lean(),
        customIDFormat.idFormat
      );
    } else {
      totalIssues = await Issue.find(filter).countDocuments();
      response = addCustomIds(
        await query
          .populate({
            path: "userId",
            select: "firstName lastName _id",
          })
          .populate("projectId", "title")
          .populate({
            path: "assignedTo",
            select: "firstName lastName _id",
            strictPopulate: false,
          })
          .populate({
            path: "testCycle",
            select: "title",
            strictPopulate: false,
          })
          .populate("device", "name")
          .lean(),
        customIDFormat.idFormat
      );
    }

    return Response.json({ issues: response, total: totalIssues });
  } catch (error: any) {
    return errorHandler(error);
  }
}
