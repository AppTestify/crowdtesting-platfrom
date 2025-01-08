import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, isClient, verifySession } from "@/app/_lib/dal";
import { Device } from "@/app/_models/device.model";
import { devicesIdsSchema } from "@/app/_schemas/device.schema";
import { normaliseIds } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";

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
    if ((await isAdmin(session.user)) || (await isClient(session.user))) {
      response = normaliseIds(
        await Device.find({})
          .populate("userId", "email firstName lastName isActive")
          .sort({ createdAt: -1 })
          .lean()
      );
    } else {
      response = normaliseIds(
        await Device.find({ userId: session.user._id })
          .sort({ createdAt: -1 })
          .lean()
      );
    }

    return Response.json(response);
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function POST(req: Request) {
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

    const body = await req.json();
    const res = devicesIdsSchema.safeParse(body);

    if (!res.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: res.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    let response = null;
    if ((await isAdmin(session.user)) || (await isClient(session.user))) {
      response = normaliseIds(
        await Device.find({})
          .populate("userId", "email firstName lastName isActive")
          .sort({ createdAt: -1 })
          .lean()
      );
    } else {
      const existingDevices = await Device.find({ userId: session.user._id })
        .sort({ createdAt: -1 })
        .lean();

      const newDevices = await Device.find()
        .where("_id")
        .in(res.data?.ids)
        .sort({ createdAt: -1 })
        .lean();

      response = normaliseIds([...existingDevices, ...newDevices]);
    }

    return Response.json(response);
  } catch (error: any) {
    return errorHandler(error);
  }
}
