import { VERIFICATION_LINK_EXPIRE_LIMIT } from "@/app/_constants/constant-server-side";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_NOT_FOUND_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { User } from "@/app/_models/user.model";
import { sendVerificationEmail } from "@/app/_utils/email";

export async function POST(req: Request) {
  try {
    const session = await verifySession();

    if (!session || !session.user._id) {
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

    sendVerificationEmail(session.user);

    const existingUser = await User.findById(session.user);
    if (!existingUser) {
      return Response.json(
        { message: USER_NOT_FOUND_ERROR_MESSAGE },
        { status: HttpStatusCode.NOT_FOUND }
      );
    }

    existingUser.accountActivationMailSentAt = new Date();
    existingUser.save();

    return Response.json({
      message: "Verification mail sent successfully",
    });
  } catch (error: any) {
    return Response.json(
      { message: GENERIC_ERROR_MESSAGE },
      { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
}
