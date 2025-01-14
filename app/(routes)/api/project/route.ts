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
    const url = new URL(req.url);
    const searchString = url.searchParams.get("searchString");
    const { skip, limit } = serverSidePagination(req);
    const projectIdFormat = await IdFormat.findOne({
      entity: DBModels.PROJECT,
    });

    if (searchString) {
      if (await isAdmin(session.user)) {
        const { projects, totalProjects } = await filterProjectsForAdmin(
          searchString,
          skip,
          limit,
          projectIdFormat
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
          session.user
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
          session.user
        );
        return Response.json({
          projects: addCustomIds(projects, projectIdFormat?.idFormat),
          total: totalProjects,
        });
      }
    }

    if (await isAdmin(session.user)) {
      response = addCustomIds(
        await Project.find({ deletedAt: { $exists: false } })
          .populate("userId")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        projectIdFormat.idFormat
      );
      totalProjects = await Project.find({
        deletedAt: { $exists: false },
      }).countDocuments();
    } else if (await isClient(session.user)) {
      response = addCustomIds(
        await Project.find({
          deletedAt: { $exists: false },
          userId: session.user._id,
        })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        projectIdFormat.idFormat
      );
      totalProjects = await Project.find({
        deletedAt: { $exists: false },
        userId: session.user._id,
      }).countDocuments();
    } else {
      response = addCustomIds(
        await Project.find({
          "users.userId": session.user._id,
          deletedAt: { $exists: false },
        })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        projectIdFormat.idFormat
      );
      totalProjects = await Project.find({
        "users.userId": session.user._id,
        deletedAt: { $exists: false },
      }).countDocuments();
    }
    return Response.json({ projects: response, total: totalProjects });
  } catch (error: any) {
    return errorHandler(error);
  }
}
