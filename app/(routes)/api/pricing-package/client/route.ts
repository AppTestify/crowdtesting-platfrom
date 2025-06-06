import { DB_CONNECTION_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { Package } from "@/app/_models/package.model";
import { errorHandler } from "@/app/_utils/error-handler";

export async function GET(req: Request) {
  try {
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
    const status = url.searchParams.get("status");

    const filter: any = { deletedAt: { $exists: false } };
    if (status !== null) {
      filter.isActive = status === "true";
    }

    const packages = await Package.find(filter).lean();

    const total = await Package.countDocuments(filter);

    return Response.json({ packages, total });
  } catch (error: any) {
    return errorHandler(error);
  }
}



