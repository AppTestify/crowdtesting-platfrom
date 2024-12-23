import { DB_CONNECTION_ERROR_MESSAGE, INVALID_INPUT_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { verifySession } from "@/app/_lib/dal";
import { Website } from "@/app/_models/website.model";
import { websiteSchema } from "@/app/_schemas/website.schema";
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

        const body = await req.json();
        const response = websiteSchema.safeParse(body);

        if (!response.success) {
            return Response.json(
                {
                    message: INVALID_INPUT_ERROR_MESSAGE,
                    errors: response.error.errors,
                },
                { status: HttpStatusCode.BAD_REQUEST }
            );
        }
        const userId = session.user._id;
        const previousWebsiteResponse = await Website.find({ userId: userId })

        if (previousWebsiteResponse.length > 0) {
            await Website.findOneAndUpdate(
                { userId: userId },
                { $set: { ...response.data } },
                { new: true });
        } else {
            const newWebsite = new Website({
                ...response.data,
                userId: userId,
            });
            await newWebsite.save();
        }

        return Response.json({
            message: "website updated successfully",
        });

    } catch (error: any) {
        return errorHandler(error);
    }
}

export async function GET(req: Request) {
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

        const response = await Website.find({}).lean();
        // const attachmentService = new AttachmentService();
        // const fileResponse = await attachmentService.downloadFileFromDrive(response[0]?.logo?.cloudId);

        return Response.json(response);
    } catch (error: any) {
        return errorHandler(error);
    }
}