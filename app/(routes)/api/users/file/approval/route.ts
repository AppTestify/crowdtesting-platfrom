import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { File } from "@/app/_models/file.model";
import { filterDocuments } from "@/app/_queries/search-document";
import { serverSidePagination } from "@/app/_utils/common-server-side";
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
    const verify = url.searchParams.get("verify");
    const searchString = url.searchParams.get("searchString");
    const { skip, limit } = serverSidePagination(req);

    const totalDocuments = await File.find({
      isVerify: verify,
    }).countDocuments();

    if (searchString) {
      const { documents, totalDocuments } = await filterDocuments(
        searchString,
        skip,
        limit,
        verify === "true"
      );
      return Response.json({
        documents: normaliseIds(documents),
        total: totalDocuments,
      });
    }

    const result = normaliseIds(
      await File.find({ isVerify: verify })
        .populate("userId verifyBy")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })
        .lean()
    ).map((doc) => {
      const { _id, userId, verifyBy, ...rest } = doc;
      return {
        ...rest,
        userId: userId ? { id: userId._id, ...userId } : null,
        verifyBy: verifyBy ? { id: verifyBy._id, ...verifyBy } : null,
      };
    });

    return Response.json({ documents: result, total: totalDocuments });
  } catch (error: any) {
    return errorHandler(error);
  }
}
