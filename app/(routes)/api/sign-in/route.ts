import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  INVALID_PASSWORD_ERROR_MESSAGE,
  USER_INACTIVE_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { createSession } from "@/app/_lib/session";
import { User } from "@/app/_models/user.model";
import { signInSchema } from "@/app/_schemas/auth.schema";
import { normalizePassword } from "@/app/_utils/common-server-side";
import bcrypt from "bcryptjs";
import { Project } from "@/app/_models/project.model";
const ObjectId = require("mongodb").ObjectId;

export async function POST(req: Request) {
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

    const body = await req.json();
    const response = signInSchema.safeParse(body);
    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const { email, password, rememberMe } = response.data;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return Response.json(
        { message: USER_UNAUTHORIZED_ERROR_MESSAGE },
        { status: HttpStatusCode.UNAUTHORIZED }
      );
    }

    if (existingUser?.isActive === false) {
      return Response.json(
        { message: USER_INACTIVE_ERROR_MESSAGE },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const normalizedPassword = normalizePassword(password);
    const isPasswordValid = await bcrypt.compare(
      normalizedPassword,
      existingUser.password
    );

    if (!isPasswordValid) {
      return Response.json(
        { message: INVALID_PASSWORD_ERROR_MESSAGE },
        { status: HttpStatusCode.UNAUTHORIZED }
      );
    }

    const { password: _, ...userWithoutPassword } = existingUser.toObject();
    
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

    userWithoutPassword.projects = userProjectIds || [];

    await createSession(userWithoutPassword, rememberMe);

    return Response.json({
      message: "Logged in successfully",
      user: userWithoutPassword,
    });
  } catch (error: any) {
    return Response.json(
      { message: GENERIC_ERROR_MESSAGE },
      { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
}
