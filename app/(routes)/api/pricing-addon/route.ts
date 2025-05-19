import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { AddOn } from "@/app/_models/addon.model";
import { filterAddonForAdmin } from "@/app/_queries/search-addon";
import { addonSchema } from "@/app/_schemas/addon.schema";
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

    console.log(response);

    const { name, description, amount, currency, isActive } = response.data;

    const userId = session?.user?._id;

    const newAddOn = new AddOn({
      name,
      description,
      userId,
      amount,
      currency,
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

    // let response = null;
    // let totalAddons;
    // let filter: any = { deletedAt: { $exists: false } };
    // const url = new URL(req.url);

    const url = new URL(req.url);
    const searchString = url.searchParams.get("searchString") || "";
    const statusParam = url.searchParams.get("status");
    const { skip, limit } = serverSidePagination(req);

    const status =
      statusParam === "true"
        ? true
        : statusParam === "false"
        ? false
        : undefined;

    // if (statusParam !== null && statusParam !== "") {
    //   filter.isActive = status;
    // }

    if (searchString) {
      const { addOns, totalAddOns } = await filterAddonForAdmin(
        searchString,
        skip,
        limit,
        status
      );
      return Response.json({
        addon: addOns,
        total: totalAddOns,
      });
    }

    const filter: any = { deletedAt: { $exists: false } };
    if (status !== undefined) {
      filter.isActive = status;
    }

    const response = normaliseIds(
      await AddOn.find(filter)
        .populate("userId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean()
    );
    const totalAddons = await AddOn.find(filter).countDocuments();

    return Response.json({ addon: response, total: totalAddons });
  } catch (error: any) {
    return errorHandler(error);
  }
}
