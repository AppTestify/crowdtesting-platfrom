import { DBModels } from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, isClient, verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { Project } from "@/app/_models/project.model";
import {
  filterProjectsForAdmin,
  filterProjectsForClient,
  filterProjectsForTester,
} from "@/app/_queries/search-project";
import { projectSchema } from "@/app/_schemas/project.schema";
import { serverSidePagination } from "@/app/_utils/common-server-side";
import { addCustomIds } from "@/app/_utils/data-formatters";
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
    const response = projectSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const newProject = new Project({
      ...response.data,
      userId: session.user._id,
    });
    const saveProject = await newProject.save();

    return Response.json({
      message: "Project added successfully",
      id: saveProject._id,
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
    let totalProjects;
    let filter: any = { deletedAt: { $exists: false } };
    const url = new URL(req.url);

    // Take a status and convert into boolean
    const statusParam = url.searchParams.get("status");
    const status = statusParam === "true";

    const searchString = url.searchParams.get("searchString");
    const { skip, limit } = serverSidePagination(req);
    const projectIdFormat = await IdFormat.findOne({
      entity: DBModels.PROJECT,
    });

    if (statusParam !== null && statusParam !== "") {
      filter.isActive = status;
    }

    if (searchString) {
      if (await isAdmin(session.user)) {
        const { projects, totalProjects } = await filterProjectsForAdmin(
          searchString,
          skip,
          limit,
          projectIdFormat,
          status || undefined
        );
        return Response.json({
          projects: addCustomIds(projects, projectIdFormat?.idFormat),
          total: totalProjects,
        });
      } else if (await isClient(session.user)) {
        const { projects, totalProjects } = await filterProjectsForClient(
          searchString,
          skip,
          limit,
          projectIdFormat,
          session.user,
          status || undefined
        );
        return Response.json({
          projects: addCustomIds(projects, projectIdFormat?.idFormat),
          total: totalProjects,
        });
      } else {
        const { projects, totalProjects } = await filterProjectsForTester(
          searchString as string,
          skip,
          limit,
          projectIdFormat,
          session.user,
          status || undefined
        );
        return Response.json({
          projects: addCustomIds(projects, projectIdFormat?.idFormat),
          total: totalProjects,
        });
      }
    }

    if (await isAdmin(session.user)) {
      response = addCustomIds(
        await Project.find(filter)
          .populate("userId")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        projectIdFormat.idFormat
      );
      totalProjects = await Project.find(filter).countDocuments();
    } else if (await isClient(session.user)) {
      response = addCustomIds(
        await Project.find(filter)
          .find({
            $or: [
              { "users.userId": session.user._id },
              { userId: session.user._id },
            ],
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        projectIdFormat.idFormat
      );
      totalProjects = await Project.find(filter)
        .find({
          $or: [
            { "users.userId": session.user._id },
            { userId: session.user._id },
          ],
        })
        .countDocuments();
    } else {
      response = addCustomIds(
        await Project.find(filter)
          .find({
            users: {
              $elemMatch: {
                userId: session.user._id,
                $or: [
                  { isVerify: { $exists: false } },
                  { isVerify: { $ne: false } },
                ],
              },
            },
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        projectIdFormat.idFormat
      );

      totalProjects = await Project.find(filter)
        .find({
          users: {
            $elemMatch: {
              userId: session.user._id,
              $or: [
                { isVerify: { $exists: false } },
                { isVerify: { $ne: false } },
              ],
            },
          },
        })
        .countDocuments();
    }
    return Response.json({ projects: response, total: totalProjects });
  } catch (error: any) {
    return errorHandler(error);
  }
}
