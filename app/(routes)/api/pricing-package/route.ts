import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { Package } from "@/app/_models/package.model";
import { filterPackageForAdmin } from "@/app/_queries/search-package";
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
    const response = packageSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const {
      type,
      name,
      description,
      testers,
      durationHours,
      amount,
      currency,
      bugs,
      testCase,
      testExecution,
      moreBugs,
      isCustom,
      isActive,
    } = response.data;

    const userId = session?.user?._id;

    const newPackage = new Package({
      type,
      name,
      description,
      testers,
      userId,
      durationHours,
      amount,
      currency,
      bugs,
      moreBugs,
      testCase,
      testExecution,
      isCustom,
      isActive,
    });
    await newPackage.save();

    return Response.json({
      message: "Package added successfully",
      package: newPackage,
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}

// export async function GET(req: Request) {
//   try {
//     const session = await verifySession();

//     if (!session) {
//       return Response.json(
//         { message: USER_UNAUTHORIZED_ERROR_MESSAGE },
//         { status: HttpStatusCode.UNAUTHORIZED }
//       );
//     }

//     if (!(await isAdmin(session?.user))) {
//       return Response.json(
//         { message: USER_UNAUTHORIZED_ERROR_MESSAGE },
//         { status: HttpStatusCode.UNAUTHORIZED }
//       );
//     }

//     const isDBConnected = await connectDatabase();
//     if (!isDBConnected) {
//       return Response.json(
//         {
//           message: DB_CONNECTION_ERROR_MESSAGE,
//         },
//         { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
//       );
//     }

//     let response = null;
//     let totalPackages;
//     let filter: any = { deletedAt: { $exists: false } };
//     const url = new URL(req.url);

//     const statusParam = url.searchParams.get("status");
//     const status = statusParam === "true";
//     const searchString = url.searchParams.get("searchString");
//     const { skip, limit } = serverSidePagination(req);

//     if (statusParam !== null && statusParam !== "") {
//       filter.isActive = status;
//     }

//     if (searchString) {
//       const { packages, totalPackages } = await filterPackageForAdmin(
//         searchString,
//         skip,
//         limit,
//         status
//       );
//       return Response.json({
//         packages,
//         total: totalPackages,
//       });
//     }

//     response = normaliseIds(
//       await Package.find(filter)
//         .populate("userId")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(Number(limit))
//         .lean()
//     );
//     totalPackages = await Package.find(filter).countDocuments();

//     return Response.json({ packages: response, total: totalPackages });
//   } catch (error: any) {
//     return errorHandler(error);
//   }
// }

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

    const url = new URL(req.url);
    const searchString = url.searchParams.get("searchString") || "";
    const statusParam = url.searchParams.get("status");
    const { skip, limit } = serverSidePagination(req);

    // Pass the raw value (true/false/"true"/"false"/null) to the filter function
    const status =
      statusParam === "true"
        ? true
        : statusParam === "false"
        ? false
        : undefined;

    // If there's any search string or status, use the filter logic
    if (searchString || status !== undefined) {
      const { packages, totalPackages } = await filterPackageForAdmin(
        searchString,
        skip,
        limit,
        status
      );
      return Response.json({
        packages,
        total: totalPackages,
      });
    }

    //  Fallback: just basic list with optional status filter
    const filter: any = { deletedAt: { $exists: false } };
    if (status !== undefined) {
      filter.isActive = status;
    }

    const response = normaliseIds(
      await Package.find(filter)
        .populate("userId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean()
    );

    const totalPackages = await Package.find(filter).countDocuments();

    return Response.json({ packages: response, total: totalPackages });
  } catch (error: any) {
    return errorHandler(error);
  }
}

