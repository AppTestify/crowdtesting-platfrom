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
import { User } from "@/app/_models/user.model";
import { filterProjectUsers } from "@/app/_queries/search-project-users";
import { projectUserSchema } from "@/app/_schemas/project.schema";
import { serverSidePagination } from "@/app/_utils/common-server-side";
import { addCustomIds, replaceCustomId } from "@/app/_utils/data-formatters";
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

    const url = new URL(req.url);
    const { projectId } = params;
    const { skip, limit } = serverSidePagination(req);
    const userIdFormat = await IdFormat.findOne({ entity: DBModels.USER });
    const searchString = url.searchParams.get("searchString");

    // Step 1: Get the project without populating users
    const project = (await Project.findById(projectId)
      .select("_id users")
      .lean()
      .exec()) as { _id: string; users: any[] } | null;

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    // Step 2: Paginate the users array
    const totalUsers = project.users.length;
    const paginatedUsers = project.users.slice(skip, skip + Number(limit));

    // Step 3: Populate only the paginated users
    const populatedUsers = await User.find({
      _id: { $in: paginatedUsers.map((user: any) => user.userId) },
    })
      .select("firstName lastName role customId")
      .lean();

    // if (searchString) {
    //   const result = await filterProjectUsers(
    //     searchString,
    //     skip,
    //     limit,
    //     userIdFormat,
    //     projectId,
    //     project as any,
    //     totalUsers
    //   );
    //   return Response.json({
    //     data: result,
    //   });
    // }

    // Step 4: Map users and add additional data
    const usersWithCustomIds = await Promise.all(
      paginatedUsers.map(async (user: any) => {
        const userInfo = populatedUsers.find((u: any) =>
          u?._id.equals(user.userId)
        );
        const customIdTransformed = replaceCustomId(
          userIdFormat.idFormat,
          userInfo?.customId
        );

        const tester = await Tester.findOne({ user: userInfo?._id })
          .select("address languages skills")
          .sort({ _id: -1 });

        return {
          ...user,
          userId: userInfo,
          customId: customIdTransformed,
          tester: tester,
        };
      })
    );

    const result = {
      _id: project._id,
      users: usersWithCustomIds,
      total: totalUsers,
    };

    return Response.json({ data: result });
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
