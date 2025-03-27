import { DBModels } from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import { isAdmin, isClient, isTester, verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { Issue } from "@/app/_models/issue.model";
import { Project } from "@/app/_models/project.model";
import { Task } from "@/app/_models/task.model";
import { User } from "@/app/_models/user.model";
import {
  filterTasksForAdmin,
  filterTasksForClient,
  filterTasksForTester,
} from "@/app/_queries/search-task";
import { TaskSchema } from "@/app/_schemas/task.schema";
import {
  getTestCycleBasedIds,
  serverSidePagination,
} from "@/app/_utils/common-server-side";
import { normaliseIds, replaceCustomId } from "@/app/_utils/data-formatters";
import { taskAssignMail } from "@/app/_utils/email";
import { errorHandler } from "@/app/_utils/error-handler";
import { ObjectId } from "mongodb";

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

    if (response.data.assignedTo) {
      const assignUser = await User.findById(response.data.assignedTo).select(
        "email firstName lastName"
      );
      const payload = {
        subject: `Task assigned to You - ${response.data.title} - [${response?.data?.status}]`,
        name: response.data.title,
        status: response.data.status || "",
        email: assignUser?.email,
        fullName: `${assignUser?.firstName} ${assignUser?.lastName}` || "",
        description: response.data.description,
        assignedBy: `${session.user.firstName} ${session.user.lastName}` || "",
        priority: response.data.priority,
      };
      await taskAssignMail(payload);
    }

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
    const userIdFormat = await IdFormat.findOne({
      entity: DBModels.USER,
    });

    // for tester
    const project = await Project.findById(projectId);
    const testCycleIds = getTestCycleBasedIds(project, session.user?._id);
    const issues = await Issue.find({
      testCycle: { $in: testCycleIds },
    });
    const query =
      testCycleIds?.length > 0 && session.user?.role === UserRoles.TESTER
        ? {
            projectId: new ObjectId(projectId),
            issueId: { $in: issues.map((issue) => issue._id) },
          }
        : { projectId: projectId };
    const totalTasks = await Task.find({
      projectId: projectId,
    }).countDocuments();

    if (searchString) {
      if (await isAdmin(session.user)) {
        const { tasks, totalTasks } = await filterTasksForAdmin(
          searchString,
          skip,
          limit,
          projectId
        );
        return Response.json({
          tasks: normaliseIds(tasks),
          total: totalTasks,
        });
      } else if (await isTester(session.user)) {
        const issueIds = issues.map((issue) => issue._id);
        const { tasks, totalTasks } = await filterTasksForTester(
          searchString,
          skip,
          limit,
          testCycleIds,
          projectId,
          issueIds
        );
        return Response.json({
          tasks: normaliseIds(tasks),
          total: totalTasks,
        });
      } else {
        const { tasks, totalTasks } = await filterTasksForClient(
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
    }

    const data = normaliseIds(
      await Task.find(query)
        .populate("userId", "firstName lastName")
        .populate("assignedTo", "firstName lastName customId")
        .populate("issueId", "title")
        .populate("requirementIds", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean()
    );

    const response = data?.map((res) => ({
      ...res,
      assignedTo: res.assignedTo
        ? {
            ...res.assignedTo,
            customId: replaceCustomId(
              userIdFormat?.idFormat,
              res.assignedTo?.customId
            ),
          }
        : null,
    }));
    return Response.json({ tasks: response, total: totalTasks });
  } catch (error: any) {
    return errorHandler(error);
  }
}
