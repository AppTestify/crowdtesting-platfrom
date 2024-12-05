import { DBModels } from "@/app/_constants";
import { DB_CONNECTION_ERROR_MESSAGE, INVALID_INPUT_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { RequirementAttachment } from "@/app/_models/requirement-attachment.model";
import { Requirement } from "@/app/_models/requirement.model";
import { requirementSchema } from "@/app/_schemas/requirement.schema";
import { getFileMetaData, serverSidePagination } from "@/app/_utils/common-server-side";
import { addCustomIds } from "@/app/_utils/data-formatters";
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
            projectId: body.get("projectId"),
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

        const attachmentIds =
            await Promise.all(
                attachments.map(async (file) => {
                    if (file) {
                        const { data, name, contentType } = await getFileMetaData(file);
                        const newAttachment = new RequirementAttachment({
                            data: data,
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
        const { skip, limit } = serverSidePagination(req);
        const totalRequirements = await Requirement.find({
            projectId: projectId
        }).countDocuments();
        const userIdFormat = await IdFormat.findOne({ entity: DBModels.REQUIREMENT });
        if (!(await isAdmin(session.user))) {
            response = addCustomIds(
                await Requirement.find({ projectId: projectId })
                    .populate("attachments")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit))
                    .lean(),
                userIdFormat.idFormat
            );
        } else {
            response = addCustomIds(
                await Requirement.find({ projectId: projectId })
                    .populate("userId attachments")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit))
                    .lean(),
                userIdFormat.idFormat
            );
        }

        return Response.json({ "requirements": response, "total": totalRequirements });
    } catch (error: any) {
        return errorHandler(error);
    }
}