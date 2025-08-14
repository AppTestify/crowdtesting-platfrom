import { DBModels } from "@/app/_constants";
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
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { RequirementAttachment } from "@/app/_models/requirement-attachment.model";
import { Requirement } from "@/app/_models/requirement.model";
import { User } from "@/app/_models/user.model";
import { Project } from "@/app/_models/project.model";
import {
  filterRequirementsForAdmin,
  filterRequirementsNotForAdmin,
} from "@/app/_queries/search-requirement";
import { requirementSchema } from "@/app/_schemas/requirement.schema";
import {
  getFileMetaData,
  serverSidePagination,
} from "@/app/_utils/common-server-side";
import { addCustomIds, replaceCustomId } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";
import { requirementAssignMail } from "@/app/_utils/email";

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
      projectId: body.get("projectId"),
      assignedTo: body.get("assignedTo") || null,
      status: body.get("status"),
      startDate: body.get("startDate"),
      endDate: body.get("endDate"),
    };
    const response = requirementSchema.safeParse(formData);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const newRequirement = new Requirement({
      ...response.data,
      userId: session.user._id,
    });

    const savedRequirement = await newRequirement.save();

    const attachmentService = new AttachmentService();
    const attachmentIds = await Promise.all(
      attachments.map(async (file) => {
        if (file) {
          const { name, contentType } = await getFileMetaData(file);
          const cloudId =
            await attachmentService.uploadFileInGivenFolderInDrive(
              file,
              AttachmentFolder.REQUIREMENTS
            );
          const newAttachment = new RequirementAttachment({
            cloudId: cloudId,
            name,
            contentType,
            requirementId: savedRequirement._id,
          });

          const savedAttachment = await newAttachment.save();
          return savedAttachment._id;
        }
        return null;
      })
    );

    const validAttachmentIds = attachmentIds.filter((id) => id !== null);

    await Requirement.findByIdAndUpdate(
      savedRequirement._id,
      { $push: { attachments: { $each: validAttachmentIds } } },
      { new: true }
    );

    // Send email notification if requirement is assigned to someone
    if (response.data.assignedTo) {
      try {
        const assignedUser = await User.findById(response.data.assignedTo).select("firstName lastName email");
        const project = await Project.findById(response.data.projectId).select("title");
        const assignedByUser = await User.findById(session.user._id).select("firstName lastName");

        if (assignedUser && assignedUser.email && project) {
          const emailPayload = {
            email: assignedUser.email,
            fullName: `${assignedUser.firstName || ''} ${assignedUser.lastName || ''}`.trim(),
            title: response.data.title,
            description: response.data.description || 'No description provided',
            assignedBy: `${assignedByUser?.firstName || ''} ${assignedByUser?.lastName || ''}`.trim(),
            status: response.data.status,
            projectName: project.title,
            startDate: response.data.startDate || 'Not specified',
            endDate: response.data.endDate || 'Not specified',
          };

          await requirementAssignMail(emailPayload);
        }
      } catch (emailError) {
        console.error('Failed to send requirement assignment email:', emailError);
        // Don't fail the entire request if email fails
      }
    }

    return Response.json({
      message: "Requirement added successfully",
      id: savedRequirement?._id,
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
    
    // Parse status filter from search string
    let statusFilter = null;
    let cleanSearchString = searchString;
    
    if (searchString && searchString.includes('status:')) {
      const statusMatch = searchString.match(/status:(\w+)/);
      if (statusMatch) {
        statusFilter = statusMatch[1];
        cleanSearchString = searchString.replace(/status:\w+/, '').trim();
      }
    }
    
    const totalRequirements = await Requirement.find({
      projectId: projectId,
      ...(statusFilter && { status: statusFilter }),
    }).countDocuments();
    const requirementIdFormat = await IdFormat.findOne({
      entity: DBModels.REQUIREMENT,
    });
    const userIdFormat = await IdFormat.findOne({
      entity: DBModels.USER,
    });

    if (cleanSearchString) {
      if (!(await isAdmin(session.user))) {
        const { requirements, totalRequirements } =
          await filterRequirementsNotForAdmin(
            searchString, // Pass original searchString to maintain status filter
            skip,
            limit,
            projectId,
            requirementIdFormat
          );
        return Response.json({
          requirements: addCustomIds(
            requirements,
            requirementIdFormat?.idFormat
          ),
          total: totalRequirements,
        });
      } else {
        const { requirements, totalRequirements } =
          await filterRequirementsForAdmin(
            searchString, // Pass original searchString to maintain status filter
            skip,
            limit,
            projectId,
            requirementIdFormat
          );
        return Response.json({
          requirements: addCustomIds(
            requirements,
            requirementIdFormat?.idFormat
          ),
          total: totalRequirements,
        });
      }
    }

    if (!(await isAdmin(session.user))) {
      const data = addCustomIds(
        await Requirement.find({ 
          projectId: projectId,
          ...(statusFilter && { status: statusFilter }),
        })
          .populate("userId", "firstName lastName")
          .populate("assignedTo", "firstName lastName customId")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        requirementIdFormat.idFormat
      );
      // userIdFormat
      response = data?.map((res) => ({
        ...res,
        assignedTo: res.assignedTo
          ? {
              ...res.assignedTo,
              customId: replaceCustomId(
                userIdFormat?.idFormat,
                res.assignedTo?.customId
              ),
            }
          : null,
      }));
    } else {
      response = addCustomIds(
        await Requirement.find({ 
          projectId: projectId,
          ...(statusFilter && { status: statusFilter }),
        })
          .populate("userId", "firstName lastName")
          .populate("assignedTo", "firstName lastName customId")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        requirementIdFormat.idFormat
      );
    }

    return Response.json({ 
      requirements: response, 
      total: totalRequirements 
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}
