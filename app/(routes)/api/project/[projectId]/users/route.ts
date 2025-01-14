import { DBModels } from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { Counter } from "@/app/_models/counter.model";
import { IdFormat } from "@/app/_models/id-format.model";
import { Project } from "@/app/_models/project.model";
import { Tester } from "@/app/_models/tester.model";
import { projectUserSchema } from "@/app/_schemas/project.schema";
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

    const response: any = await Project.findById(projectId)
      .populate("users.userId", "firstName lastName role customId")
      .select("_id users")
      .lean();

    const usersWithCustomIds = await Promise.all(
      response?.users.map(async (user: any) => {
        const customIdTransformed = replaceCustomId(
          userIdFormat.idFormat,
          user.userId?.customId
        );
        const tester = await Tester.findOne({ user: user.userId?._id }).select(
          "address"
        );
        return {
          ...user,
          customId: customIdTransformed,
          tester: tester,
        };
      })
    );

    const result = {
      ...response,
      users: usersWithCustomIds,
    };

    return Response.json(result);
  } catch (error: any) {
    return errorHandler(error);
  }
}

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

    const body = await req.json();
    const response = projectUserSchema.safeParse(body);
    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const { userId, role } = response.data;
    const { projectId } = params;
    const counter = await Counter.findOneAndUpdate(
      { entity: DBModels.PROJECT_USERS, projectId: projectId },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true }
    );

    const updateResponse = await Project.findByIdAndUpdate(
      projectId,
      {
        $addToSet: {
          users: { userId: userId, role: role, customId: counter.sequence },
        },
      },
      { new: true }
    );

    if (!updateResponse) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    return Response.json({
      message: "user added in project",
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await verifySession();
    if (!session) {
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

    const body = await req.json();
    const response = projectUserSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const { userId, role } = response.data;
    const { projectId } = params;
    const updateResponse = await Project.findByIdAndUpdate(
      projectId,
      {
        $set: { "users.$[elem].role": role },
      },
      {
        arrayFilters: [{ "elem.userId": userId }],
        new: true,
      }
    );

    if (!updateResponse) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    return Response.json({
      message: "Project user updated successfully",
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}
