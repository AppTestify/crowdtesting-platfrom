import { DB_CONNECTION_ERROR_MESSAGE, GENERIC_ERROR_MESSAGE, INVALID_INPUT_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { verifySession } from "@/app/_lib/dal";
import { RequirementAttachment } from "@/app/_models/requirement-attachment.model";
import { Requirement } from "@/app/_models/requirement.model";
import { User } from "@/app/_models/user.model";
import { Project } from "@/app/_models/project.model";
import { IdFormat } from "@/app/_models/id-format.model";
import { requirementSchema } from "@/app/_schemas/requirement.schema";
import { errorHandler } from "@/app/_utils/error-handler";
import { requirementAssignMail } from "@/app/_utils/email";
import { addCustomIds } from "@/app/_utils/data-formatters";
import { DBModels } from "@/app/_constants";

export async function GET(
    req: Request,
    { params }: { params: { requirementId: string } }
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

        const { requirementId } = params;

        const requirement = await Requirement.findById(requirementId)
            .populate('assignedTo', 'firstName lastName email customId')
            .populate('userId', 'firstName lastName email customId')
            .populate('projectId', 'title isActive')
            .lean();

        if (!requirement) {
            return Response.json(
                { message: "Requirement not found" },
                { status: HttpStatusCode.NOT_FOUND }
            );
        }

        // Get the requirement ID format to format the customId
        const requirementIdFormat = await IdFormat.findOne({ entity: DBModels.REQUIREMENT });
        
        // Format the requirement data using addCustomIds to convert _id to id
        const formattedRequirement = addCustomIds([requirement], requirementIdFormat?.idFormat || '')[0];

        return Response.json(
            {
                message: "Requirement retrieved successfully",
                data: formattedRequirement,
            },
            { status: HttpStatusCode.OK }
        );
    } catch (error) {
        return errorHandler(error);
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { requirementId: string } }
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
        const response = requirementSchema.safeParse(body);

        if (!response.success) {
            return Response.json(
                {
                    message: INVALID_INPUT_ERROR_MESSAGE,
                    errors: response.error.errors,
                },
                { status: HttpStatusCode.BAD_REQUEST }
            );
        }

        const { requirementId } = params;
        
        // Get the previous requirement data to check for assignment changes
        const previousRequirement = await Requirement.findById(requirementId).lean();
        
        const updateResponse = await Requirement.findByIdAndUpdate(requirementId, {
            ...response.data
        }, { new: true }).populate('assignedTo', 'firstName lastName email customId').populate('userId', 'firstName lastName email').populate('projectId', 'title isActive');

        if (!updateResponse) {
            throw new Error(GENERIC_ERROR_MESSAGE);
        }

        // Check if assignment has changed and send email notification
        const previousAssignedTo = (previousRequirement as any)?.assignedTo?.toString();
        const newAssignedTo = response.data.assignedTo;
        
        if (newAssignedTo && previousAssignedTo !== newAssignedTo) {
            try {
                const assignedUser = await User.findById(newAssignedTo).select("firstName lastName email");
                const project = await Project.findById(response.data.projectId).select("title");
                const assignedByUser = await User.findById(session.user._id).select("firstName lastName");

                if (assignedUser && assignedUser.email && project) {
                    const emailPayload = {
                        email: assignedUser.email,
                        fullName: `${assignedUser.firstName} ${assignedUser.lastName}`,
                        title: response.data.title,
                        description: response.data.description,
                        assignedBy: `${assignedByUser?.firstName} ${assignedByUser?.lastName}`,
                        status: response.data.status,
                        projectName: project.title,
                        startDate: response.data.startDate ? new Date(response.data.startDate).toLocaleDateString() : undefined,
                        endDate: response.data.endDate ? new Date(response.data.endDate).toLocaleDateString() : undefined,
                    };

                    await requirementAssignMail(emailPayload);
                }
            } catch (emailError) {
                console.error("Failed to send assignment email:", emailError);
                // Don't fail the update if email fails
            }
        }

        return Response.json(
            {
                message: "Requirement updated successfully",
                data: updateResponse,
            },
            { status: HttpStatusCode.OK }
        );
    } catch (error) {
        return errorHandler(error);
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { requirementId: string } }
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

        const { requirementId } = params;

        // Find the requirement to get its attachments
        const requirement = await Requirement.findById(requirementId);
        if (!requirement) {
            return Response.json(
                { message: "Requirement not found" },
                { status: HttpStatusCode.NOT_FOUND }
            );
        }

        // Delete all attachments
        if (requirement.attachments && requirement.attachments.length > 0) {
            const attachments = await RequirementAttachment.find({
                _id: { $in: requirement.attachments }
            });

            const attachmentService = new AttachmentService();
            for (const attachment of attachments) {
                try {
                    await attachmentService.deleteFileFromDrive(attachment.cloudId);
                    await RequirementAttachment.findByIdAndDelete(attachment._id);
                } catch (attachmentError) {
                    console.error("Failed to delete attachment:", attachmentError);
                }
            }
        }

        // Delete the requirement
        await Requirement.findByIdAndDelete(requirementId);

        return Response.json(
            { message: "Requirement deleted successfully" },
            { status: HttpStatusCode.OK }
        );
    } catch (error) {
        return errorHandler(error);
    }
} 