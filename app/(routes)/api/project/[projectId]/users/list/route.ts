import { DBModels } from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { Project } from "@/app/_models/project.model";
import { User } from "@/app/_models/user.model";
import { replaceCustomId } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";

export async function GET(
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

    const { projectId } = params;
    const userIdFormat = await IdFormat.findOne({ entity: DBModels.USER });

    const project = (await Project.findById(projectId)
      .select("_id users")
      .lean()
      .exec()) as { _id: string; users: any[] } | null;

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    const populatedUsers = await User.find({
      _id: { $in: project?.users?.map((user: any) => user.userId) },
    })
      .select("firstName lastName role customId")
      .lean();

    const usersWithCustomIds = await Promise.all(
      project.users.map(async (user: any) => {
        const userInfo = populatedUsers.find((u: any) =>
          u?._id.equals(user.userId)
        );
        const customIdTransformed = replaceCustomId(
          userIdFormat.idFormat,
          userInfo?.customId
        );

        return {
          ...user,
          userId: userInfo,
          customId: customIdTransformed,
        };
      })
    );

    const result = {
      _id: project._id,
      users: usersWithCustomIds,
    };

    return Response.json({ data: result });
  } catch (error: any) {
    return errorHandler(error);
  }
}
