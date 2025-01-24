import { AttachmentFolder } from "@/app/_constants/constant-server-side";
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
import { ProfilePicture } from "@/app/_models/profile.picture";
import { User } from "@/app/_models/user.model";
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
    const checkImageAlreadyExists = await ProfilePicture.findOne({
      userId: userId,
    });
    if (checkImageAlreadyExists) {
      const user = await ProfilePicture.findOneAndDelete({ userId: userId });
      const attachmentService = new AttachmentService();
      await attachmentService.deleteFileFromDrive(user?.cloudId);
    }

    const body = await req.formData();
    const profilePictureFile = body.get("profilePicture");

    const response = profilePictureSchema.safeParse({
      profilePicture: profilePictureFile,
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

    const { name, contentType } = await getFileMetaData(
      response.data.profilePicture
    );

    if (!profilePictureFile) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    const attachmentService = new AttachmentService();
    const cloudId = await attachmentService.uploadFileInGivenFolderInDrive(
      profilePictureFile,
      AttachmentFolder.PROFILE_PICTURES
    );

    const newAttachment = new ProfilePicture({
      cloudId: cloudId,
      name: name,
      contentType: contentType,
      userId: userId,
    });

    const savedAttachment = await newAttachment.save();

    if (savedAttachment) {
      await User.findByIdAndUpdate(userId, {
        profilePicture: savedAttachment._id,
      });
    }

    return Response.json({
      message: "Profile picture uploaded successfully",
      id: savedAttachment?._id,
      profilePicture: savedAttachment.toObject(),
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
    response = await ProfilePicture.findOne({ userId: session.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Profile picture if exists
    const attachmentService = new AttachmentService();
    if (Array.isArray(response)) {
      response = response[0];
    }

    if (response?.cloudId) {
      try {
        const fileResponse = await attachmentService.fetchFileAsBase64(
          response?.cloudId
        );
        response.data = fileResponse;
      } catch (error) {
        response.data = null;
      }
    }

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

    const userId = session.user._id;

    const user = await User.findByIdAndUpdate(userId, {
      profilePicture: undefined,
    });
    const profilePicture = await ProfilePicture.findById(user.profilePicture);
    const attachmentService = new AttachmentService();
    await attachmentService.deleteFileFromDrive(profilePicture?.cloudId);

    const response = await ProfilePicture.findOneAndDelete({
      userId,
    });

    if (!response) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    return Response.json({ message: "Profile picture removed successfully" });
  } catch (error: any) {
    return errorHandler(error);
  }
}
