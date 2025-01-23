import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { Task } from "@/app/_models/task.model";
import { User } from "@/app/_models/user.model";
import { TaskSchema } from "@/app/_schemas/task.schema";
import { taskAssignMail } from "@/app/_utils/email";
import { errorHandler } from "@/app/_utils/error-handler";

export async function DELETE(
  req: Request,
  { params }: { params: { taskId: string } }
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

    const { taskId } = params;
    const response = await Task.findByIdAndDelete(taskId);

    if (!response) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    return Response.json({ message: "Task deleted successfully" });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { taskId: string } }
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

    const { taskId } = params;

    const previousAssignedUser = await Task.findById(taskId).select(
      "assignedTo"
    );

    if (
      response.data.assignedTo &&
      previousAssignedUser?.assignedTo?.toString() !==
        response?.data?.assignedTo?.toString()
    ) {
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
          assignedBy:
            `${session.user.firstName} ${session.user.lastName}` || "",
          priority: response.data.priority,
        };
        await taskAssignMail(payload);
      }
    }

    const updatedIssue = {
      ...response.data,
      assignedTo: response.data.assignedTo || null,
    };
    const updateResponse = await Task.findByIdAndUpdate(
      taskId,
      {
        ...updatedIssue,
      },
      { new: true }
    );

    if (!updateResponse) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    return Response.json({
      message: "Task updated successfully",
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}
