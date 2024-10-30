import { DB_CONNECTION_ERROR_MESSAGE, GENERIC_ERROR_MESSAGE, INVALID_INPUT_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { ProfilePicture } from "@/app/_models/profile.picture";
import { profilePictureSchema } from "@/app/_schemas/profile-picture.schema";
import { getFileMetaData } from "@/app/_utils/common-server-side";
import { normaliseIds } from "@/app/_utils/data-formatters";
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
        const checkImageAlreadyExists = await ProfilePicture.findOne({ userId: userId });
        if (checkImageAlreadyExists) {
            await ProfilePicture.findOneAndDelete({ userId: userId });
        }

        const body = await req.formData();
        const profileImageFile = body.get('profileImage');
        const response = profilePictureSchema.safeParse({ profileImage: profileImageFile });

        if (!response.success) {
            return Response.json(
                {
                    message: INVALID_INPUT_ERROR_MESSAGE,
                    errors: response.error.errors,
                },
                { status: HttpStatusCode.BAD_REQUEST }
            );
        }

        const { data, name, contentType } = await getFileMetaData(response.data.profileImage);
        const newAttachment = new ProfilePicture({
            data: data,
            name: name,
            contentType: contentType,
            userId: userId,
        });

        const savedAttachment = await newAttachment.save();

        return Response.json({
            message: "Profile image added successfully",
            id: savedAttachment?._id,
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

        let response = null;

        response = normaliseIds(
            await ProfilePicture.find({ userId: session.user._id })
                .sort({ createdAt: -1 })
                .lean()
        );

        return Response.json(response);
    } catch (error: any) {
        return errorHandler(error);
    }
}

export async function DELETE(req: Request) {
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

        const response = await ProfilePicture.findOneAndDelete({ userId: session.user._id });

        if (!response) {
            throw new Error(GENERIC_ERROR_MESSAGE);
        }

        return Response.json({ message: "Profile image deleted successfully" });
    } catch (error: any) {
        return errorHandler(error);
    }
}