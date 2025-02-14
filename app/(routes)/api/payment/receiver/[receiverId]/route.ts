import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { Payment } from "@/app/_models/payment.model";
import {
  filterPaymentsForAdmin,
  filterPaymentsForNonAdmin,
} from "@/app/_queries/search-payment";
import { serverSidePagination } from "@/app/_utils/common-server-side";
import { errorHandler } from "@/app/_utils/error-handler";

export async function GET(
  req: Request,
  { params }: { params: { receiverId: string } }
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

    const url = new URL(req.url);
    const searchString = url.searchParams.get("searchString");
    const { skip, limit } = serverSidePagination(req);
    const { receiverId } = params;
    let response;

    if (searchString) {
      if (await isAdmin(session.user)) {
        const { payments, totalPayments } = await filterPaymentsForAdmin(
          searchString,
          skip,
          limit
        );
        return Response.json({
          payments: payments,
          total: totalPayments,
        });
      } else {
        const { payments, totalPayments } = await filterPaymentsForNonAdmin(
          searchString,
          skip,
          limit,
          receiverId
        );
        return Response.json({
          payments: payments,
          total: totalPayments,
        });
      }
    }

    let totalPaymentsCount;

    if (await isAdmin(session.user)) {
      totalPaymentsCount = await Payment.find().countDocuments();
      response = await Payment.find()
        .populate("receiverId", "_id firstName lastName ")
        .populate("senderId", "_id firstName lastName ")
        .skip(skip)
        .limit(Number(limit))
        .lean();
    } else {
      totalPaymentsCount = await Payment.find({
        receiverId: receiverId,
      }).countDocuments();
      response = await Payment.find({ receiverId: receiverId })
        .skip(skip)
        .limit(Number(limit))
        .lean();
    }

    return Response.json({ payments: response, total: totalPaymentsCount });
  } catch (error: any) {
    return errorHandler(error);
  }
}
