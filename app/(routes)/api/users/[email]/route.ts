import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_NOT_FOUND_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { User } from "@/app/_models/user.model";
import { errorHandler } from "@/app/_utils/error-handler";
import { Project } from "@/app/_models/project.model";
const ObjectId = require("mongodb").ObjectId;

export async function GET(
  req: Request,
  { params }: { params: { email: string } }
) {
  try {
    const isDBConnected = await connectDatabase();
    if (!isDBConnected) {
      return Response.json(
        {
          message: DB_CONNECTION_ERROR_MESSAGE,
        },
        { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
      );
    }

    const { email } = params;

    const existingUser = await User.findOne({ email }).populate(
      "profilePicture",
      "data contentType cloudId"
    );

    if (!existingUser) {
      return Response.json(
        { message: USER_NOT_FOUND_ERROR_MESSAGE },
        { status: HttpStatusCode.NOT_FOUND }
      );
    }

    // Find projects where user is either the owner or a team member
    const userProjectIds = await Project.find(
      {
        $or: [
          { userId: new ObjectId(existingUser.id) }, // Projects where user is owner
          { "users.userId": new ObjectId(existingUser.id) } // Projects where user is team member
        ]
      },
      { _id: 1 }
    ).lean();

    const { password: _, ...userWithoutPassword } = existingUser.toObject();

    return Response.json({
      ...userWithoutPassword,
      projects: userProjectIds || [],
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}
