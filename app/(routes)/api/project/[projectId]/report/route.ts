import { AttachmentFolder } from "@/app/_constants/constant-server-side";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { ReportStatus } from "@/app/_constants/issue";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { isAdmin, isClient, verifySession } from "@/app/_lib/dal";
import { ReportAttachment } from "@/app/_models/report-attachment.model";
import { Report } from "@/app/_models/report.model";
import {
  filterReportsForAdmin,
  filterReportsForTester,
} from "@/app/_queries/search-report";
import { ReportSchema } from "@/app/_schemas/report.schema";
import {
  getFileMetaData,
  serverSidePagination,
} from "@/app/_utils/common-server-side";
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
      description: body.get("description"),
    };
    const response = ReportSchema.safeParse(formData);

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

    const { projectId } = params;
    const newReport = new Report({
      ...response.data,
      userId: session.user._id,
      projectId: projectId,
      status: ReportStatus.SUBMITTED,
    });
    const savedReport = await newReport.save();

    const attachmentService = new AttachmentService();
    const attachmentIds = await Promise.all(
      attachments.map(async (file) => {
        if (file) {
          const { name, contentType } = await getFileMetaData(file);
          const cloudId =
            await attachmentService.uploadFileInGivenFolderInDrive(
              file,
              AttachmentFolder.REPORT
            );
          const newAttachment = new ReportAttachment({
            cloudId: cloudId,
            name,
            contentType,
            reportId: savedReport._id,
          });

          const savedAttachment = await newAttachment.save();
          return savedAttachment._id;
        }
        return null;
      })
    );

    const validAttachmentIds = attachmentIds.filter((id) => id !== null);

    await Report.findByIdAndUpdate(
      savedReport._id,
      { $push: { attachments: { $each: validAttachmentIds } } },
      { new: true }
    );

    return Response.json({
      message: "Report added successfully",
      id: savedReport?._id,
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
    const url = new URL(req.url);
    const searchString = url.searchParams.get("searchString");
    const { skip, limit } = serverSidePagination(req);
    const totalReports = await Report.find({
      projectId: projectId,
    }).countDocuments();

    if (searchString) {
      if (await isAdmin(session.user)) {
        const { reports, totalReports } = await filterReportsForAdmin(
          searchString,
          skip,
          limit,
          projectId
        );
        return Response.json({
          Reports: reports,
          total: totalReports,
        });
      } else if (await isClient(session.user)) {
        const { reports, totalReports } = await filterReportsForTester(
          searchString,
          skip,
          limit,
          projectId,
          true
        );
        return Response.json({
          Reports: reports,
          total: totalReports,
        });
      } else {
        const { reports, totalReports } = await filterReportsForTester(
          searchString,
          skip,
          limit,
          projectId
        );
        return Response.json({
          Reports: reports,
          total: totalReports,
        });
      }
    }

    if (await isAdmin(session.user)) {
      response = await Report.find({ projectId: projectId })
        .populate("projectId", "_id")
        .populate("userId", "id firstName lastName")
        .populate("attachments")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();
    } else if (await isClient(session.user)) {
      response = await Report.find({
        projectId: projectId,
        status: ReportStatus.APPROVED,
      })
        .populate("projectId", "_id")
        .populate("attachments")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();
    } else {
      response = await Report.find({
        $or: [
          { userId: session.user._id },
          { projectId: projectId, status: ReportStatus.APPROVED },
        ],
      })
        .populate("projectId", "_id")
        .populate("attachments")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();
    }

    return Response.json({ Reports: response, total: totalReports });
  } catch (error: any) {
    return errorHandler(error);
  }
}
