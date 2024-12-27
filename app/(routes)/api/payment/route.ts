import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { PaymentStatus } from "@/app/_constants/payment";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { Payment } from "@/app/_models/payment.model";
import { paymentSchema } from "@/app/_schemas/payment.schema";
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
    const response = paymentSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const newProject = new Payment({
      ...response.data,
      senderId: session.user._id,
      status: PaymentStatus.COMPLETED,
    });
    const saveProject = await newProject.save();

    return Response.json({
      message: "Payment added successfully",
      id: saveProject._id,
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}
