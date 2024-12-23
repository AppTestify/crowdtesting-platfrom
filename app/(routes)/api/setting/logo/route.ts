import { AttachmentFolder } from "@/app/_constants/constant-server-side";
import { DB_CONNECTION_ERROR_MESSAGE, GENERIC_ERROR_MESSAGE, INVALID_INPUT_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { verifySession } from "@/app/_lib/dal";
import { Website } from "@/app/_models/website.model";
import { websiteLogoSchema } from "@/app/_schemas/website.schema";
import { getFileMetaData } from "@/app/_utils/common-server-side";
import { errorHandler } from "@/app/_utils/error-handler";

export async function POST(req: Request) {
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

        const userId = session.user._id;
        const checkImageAlreadyExists = await Website.findOne({
            userId: userId,
        });
        const body = await req.formData();
        const logo = body.get("logo");

        const response = websiteLogoSchema.safeParse({
            logo: logo,
        });

        if (!response.success) {
            return Response.json(
                {
                    message: INVALID_INPUT_ERROR_MESSAGE,
                    errors: response.error.errors,
                },
                { status: HttpStatusCode.BAD_REQUEST }
            );
        }

        if (!logo) {
            throw new Error(GENERIC_ERROR_MESSAGE);
        }

        const attachmentService = new AttachmentService();
        const cloudId = await attachmentService.uploadFileInGivenFolderInDrive(logo, AttachmentFolder.USERS);

        if (checkImageAlreadyExists) {
            await Website.findOneAndUpdate({ userId: userId }, {
                logo: {
                    cloudId: cloudId
                }
            });
        } else {
            const newLogo = new Website({
                logo: {
                    cloudId: cloudId
                },
                userId: session.user._id
            });

            await newLogo.save();
        }

        return Response.json({
            message: "logo uploaded successfully",
        });
    } catch (error: any) {
        return errorHandler(error);
    }
}

export async function DELETE(req: Request) {
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

        await Website.findOneAndUpdate({ userId: session.user._id }, { $unset: { logo: "" } }, { new: true });

        return Response.json({ "message": "logo deleted successfully" });
    } catch (error: any) {
        return errorHandler(error);
    }
}