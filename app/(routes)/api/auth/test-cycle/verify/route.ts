import { DBModels } from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import { Counter } from "@/app/_models/counter.model";
import { Project } from "@/app/_models/project.model";
import { User } from "@/app/_models/user.model";
import { accountVerificationSchema } from "@/app/_schemas/auth.schema";
import { extractDataFromVerificationToken } from "@/app/_utils/common-server-side";

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
    const response = accountVerificationSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const { token } = response.data;
    const [id, emailSentAt, projectId] =
      extractDataFromVerificationToken(token);

    if (!id || !emailSentAt) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const user = await User.findById(id).select("role").lean();

    const existingProject = await Project.findOne({
      _id: projectId,
      "users.userId": id,
    });

    if (existingProject) {
      return Response.json({
        message: "Applied project based on test cycle successfully",
        isActivated: true,
        role: Array.isArray(user) ? undefined : user?.role,
      });
    }

    const counter = await Counter.findOneAndUpdate(
      { entity: DBModels.PROJECT_USERS, projectId: projectId },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true }
    );

    const updateResponse = await Project.findByIdAndUpdate(
      projectId,
      {
        $addToSet: {
          users: {
            userId: id,
            role: UserRoles.TESTER,
            customId: counter.sequence,
            isVerify: false,
          },
        },
      },
      { new: true }
    );

    if (!updateResponse) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    return Response.json({
      message: "Applied project based on test cycle successfully",
      isActivated: true,
      role: Array.isArray(user) ? undefined : user?.role,
    });
  } catch (error: any) {
    return Response.json(
      { message: GENERIC_ERROR_MESSAGE },
      { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
}
