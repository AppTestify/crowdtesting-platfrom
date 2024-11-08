import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { Device } from "@/app/_models/device.model";
import { deviceSchema } from "@/app/_schemas/device.schema";
import { serverSidePagination } from "@/app/_utils/common-server-side";
import { normaliseIds } from "@/app/_utils/data-formatters";
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
    const response = deviceSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const newDevice = new Device({
      ...response.data,
      userId: session.user._id,
    });
    const saveDevice = await newDevice.save();

    return Response.json({
      message: "Device added successfully",
      id: saveDevice?._id,
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
    const { skip, limit } = serverSidePagination(req);
    const totalProjects = await Device.countDocuments();

    if (!(await isAdmin(session.user))) {
      response = normaliseIds(
        await Device.find({ userId: session.user._id })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean()
      );
    } else {
      response = normaliseIds(
        await Device.find({})
          .populate("userId", "email firstName lastName isActive")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean()
      );
    }

    return Response.json({ "devices": response, "total": totalProjects });
  } catch (error: any) {
    return errorHandler(error);
  }
}