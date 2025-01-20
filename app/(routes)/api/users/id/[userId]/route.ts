import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { File } from "@/app/_models/file.model";
import { ProfilePicture } from "@/app/_models/profile.picture";
import { Project } from "@/app/_models/project.model";
import { Tester } from "@/app/_models/tester.model";
import { User } from "@/app/_models/user.model";
import { userSchema } from "@/app/_schemas/users.schema";
import { getAllAttachments } from "@/app/_utils/common-server-side";
import { errorHandler } from "@/app/_utils/error-handler";
const mongoose = require("mongoose");

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await verifySession();
    if (!session || !session.isAuth) {
      return Response.json(
        { message: USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE },
        { status: HttpStatusCode.UNAUTHORIZED }
      );
    }

    if (!(await isAdmin(session?.user))) {
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

    const { userId } = params;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user?.profilePicture) {
      await ProfilePicture.findByIdAndDelete(user?.profilePicture);
    }

    const objectIdUserId = new mongoose.Types.ObjectId(userId);

    await Project.updateMany(
      { "users.userId": objectIdUserId },
      {
        $pull: { users: { userId: objectIdUserId } },
      },
      { new: true }
    );

    const response = await User.findByIdAndDelete(userId);

    if (!response) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    return Response.json({ message: "user deleted successfully" });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { userId: string } }
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

    const body = await req.json();
    const response = userSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const { userId } = params;
    const { firstName, lastName, role, isActive } = response.data;
    const updateResponse = await User.findByIdAndUpdate(
      userId,
      {
        firstName: firstName,
        lastName: lastName,
        role: role,
        isActive: isActive,
      },
      { new: true }
    );

    if (!updateResponse) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    return Response.json({
      message: "user updated successfully",
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
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

    const { userId } = params;
    let response = await User.findById(userId).populate("profilePicture");

    if (!response) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    // If file exists
    const attachmentService = new AttachmentService();
    response = response.toObject();
    if (response.role === UserRoles.TESTER) {
      const tester = await Tester.findOne({ user: userId }).sort({ _id: -1 });
      response.tester = tester;
    }

    if (response?.profilePicture?.cloudId) {
      try {
        const fileResponse = await attachmentService.fetchFileAsBase64(
          response?.profilePicture?.cloudId
        );

        response.profilePicture = {
          ...response.profilePicture,
          data: fileResponse || null,
        };
      } catch (error) {
        console.error("Error fetching profile picture as Base64:", error);
        response.profilePicture = {
          ...response.profilePicture,
          data: null,
        };
      }
    }

    return Response.json(response);
  } catch (error: any) {
    return errorHandler(error);
  }
}
