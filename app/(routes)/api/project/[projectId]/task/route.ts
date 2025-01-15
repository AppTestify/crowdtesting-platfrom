import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { Task } from "@/app/_models/task.model";
import { filterTasks } from "@/app/_queries/search-task";
import { TaskSchema } from "@/app/_schemas/task.schema";
import { serverSidePagination } from "@/app/_utils/common-server-side";
import { addCustomIds, normaliseIds } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";

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
    const response = TaskSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const { projectId } = params;
    const newTask = new Task({
      ...response.data,
      assignedTo: response.data.assignedTo || null,
      userId: session.user._id,
      projectId: projectId,
    });
    const savedTask = await newTask.save();

    return Response.json({
      message: "Task added successfully",
      id: savedTask?._id,
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
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

    const { projectId } = params;
    const url = new URL(req.url);
    const searchString = url.searchParams.get("searchString");
    const { skip, limit } = serverSidePagination(req);
    const totalTasks = await Task.find({
      projectId: projectId,
    }).countDocuments();

    if (searchString) {
      const { tasks, totalTasks } = await filterTasks(
        searchString,
        skip,
        limit,
        projectId
      );
      return Response.json({
        tasks: normaliseIds(tasks),
        total: totalTasks,
      });
    }

    const response = normaliseIds(
      await Task.find({ projectId: projectId })
        .populate("userId", "firstName lastName")
        .populate("assignedTo", "firstName lastName")
        .populate("issueId", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean()
    );
    return Response.json({ tasks: response, total: totalTasks });
  } catch (error: any) {
    return errorHandler(error);
  }
}
