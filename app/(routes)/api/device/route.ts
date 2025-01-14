import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, isClient, verifySession } from "@/app/_lib/dal";
import { Device } from "@/app/_models/device.model";
import {
  filterDevicesForAdmin,
  filterDevicesForClient,
  filterDevicesForTester,
} from "@/app/_queries/search-device";
import { deviceSchema } from "@/app/_schemas/device.schema";
import { serverSidePagination } from "@/app/_utils/common-server-side";
import { addCustomIds, normaliseIds } from "@/app/_utils/data-formatters";
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
    const url = new URL(req.url);
    const searchString = url.searchParams.get("searchString");
    const { skip, limit } = serverSidePagination(req);
    let totalDevices;

    if (searchString) {
      if (await isAdmin(session.user)) {
        const { devices, totalDevices } = await filterDevicesForAdmin(
          searchString,
          skip,
          limit
        );

        return Response.json({
          devices: normaliseIds(devices),
          total: totalDevices,
        });
      } else if (await isClient(session.user)) {
        const { devices, totalDevices } = await filterDevicesForClient(
          searchString,
          skip,
          limit
        );

        return Response.json({
          devices: normaliseIds(devices),
          total: totalDevices,
        });
      } else {
        const { devices, totalDevices } = await filterDevicesForTester(
          searchString,
          skip,
          limit,
          session.user
        );

        return Response.json({
          devices: normaliseIds(devices),
          total: totalDevices,
        });
      }
    }

    if (await isAdmin(session.user)) {
      response = normaliseIds(
        await Device.find({})
          .populate("userId", "id email firstName lastName isActive")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean()
      );
      totalDevices = await Device.find({}).countDocuments();
    } else if (await isClient(session.user)) {
      response = normaliseIds(
        await Device.find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean()
      );
      totalDevices = await Device.find({}).countDocuments();
    } else {
      response = normaliseIds(
        await Device.find({ userId: session.user._id })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean()
      );
      totalDevices = await Device.find({
        userId: session.user._id,
      }).countDocuments();
    }
    response = response.map((res) => ({
      ...res,
      userId: {
        ...res.userId,
        id: res?.userId?._id,
      },
    }));

    return Response.json({ devices: response, total: totalDevices });
  } catch (error: any) {
    return errorHandler(error);
  }
}
