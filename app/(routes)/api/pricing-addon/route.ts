import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, isClient, isTester, verifySession } from "@/app/_lib/dal";
import { AddOn } from "@/app/_models/addon.model";
import { Package } from "@/app/_models/package.model";
import { filterAddonForAdmin } from "@/app/_queries/search-addon";
import { filterPackageForAdmin } from "@/app/_queries/search-package";
import { addonSchema } from "@/app/_schemas/addon.schema";
import { packageSchema } from "@/app/_schemas/package.schema";
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

    if (!(await isAdmin(session?.user))) {
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
    const response = addonSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    console.log(response)

    const {
      name,
      description,
      amount,
      amountType,
      isActive,
    } = response.data;

    const userId = session?.user?._id;

    const newAddOn = new AddOn({
      name,
      description,
      userId,
      amount,
      amountType,
      isActive,
    });
    await newAddOn.save();

    return Response.json({
      message: "AddOn added successfully",
      addon: newAddOn,
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function GET(req: Request) {
  try {
    const session = await verifySession();

    if (!session) {
      return Response.json(
        { message: USER_UNAUTHORIZED_ERROR_MESSAGE },
        { status: HttpStatusCode.UNAUTHORIZED }
      );
    }

    if (!(await isAdmin(session?.user))) {
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

    let response = null;
    let totalAddons;
    let filter: any = { deletedAt: { $exists: false } };
    const url = new URL(req.url);

    const statusParam = url.searchParams.get("status");
    const status = statusParam === "true";
    const searchString = url.searchParams.get("searchString");
    const { skip, limit } = serverSidePagination(req);

    if (statusParam !== null && statusParam !== "") {
      filter.isActive = status;
    }

    if (searchString) {
      const { addOns, totalAddOns } = await filterAddonForAdmin(
        searchString,
        skip,
        limit,
        status
      );
      return Response.json({
        addOns,
        total: totalAddOns,
      });
    }

    response = normaliseIds(
      await AddOn.find(filter)
        .populate("userId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean()
    );
    totalAddons = await Package.find(filter).countDocuments();

    return Response.json({ addon: response, total: totalAddons });

  } catch (error: any) {
    return errorHandler(error);
  }
}
